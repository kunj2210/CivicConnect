"""
CivicConnect Batch AI Processor (Nightly Fallback / Retry Runner)
Reads pending processing_jobs from Supabase, downloads from S3,
runs HF/Groq classification, and commits results using the SQL RPC function.
"""
import os
import requests
import json
import boto3
from supabase import create_client

def load_env():
    # Load from backend/.env relative to this file
    path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend', '.env'))
    if os.path.exists(path):
        with open(path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, val = line.split('=', 1)
                    # Strip quotes if present
                    val = val.strip().strip('"').strip("'")
                    os.environ[key.strip()] = val
        print(f"SUCCESS: Loaded environment variables from {path}")
    else:
        print(f"WARNING: Could not find .env file at {path}")

# Load env vars first
load_env()

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_ROLE = os.environ.get('SUPABASE_SERVICE_ROLE')
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID') or os.environ.get('MINIO_ACCESS_KEY')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY') or os.environ.get('MINIO_SECRET_KEY')
AWS_REGION = os.environ.get('AWS_REGION', 'ap-south-1')
HF_TOKEN = os.environ.get('HF_TOKEN')
HF_MODEL_ID = os.environ.get('HF_MODEL_ID', 'manthan2876/CivicConnect-Classifier')
GROQ_API_KEY = os.environ.get('OPEN_SOURCE_LLM_KEY')
GROQ_URL = os.environ.get('OPEN_SOURCE_LLM_URL', 'https://api.groq.com/openai/v1')
LLM_MODEL = os.environ.get('LLM_MODEL', 'llama-3.1-8b-instant')

BUCKET = os.environ.get('MINIO_BUCKET') or 'civic-connect-data'
MAX_RETRIES = 3

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
s3 = boto3.client('s3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def get_gradio_predictions(file_bytes):
    try:
        # Direct predict request to Gradio API
        gradio_api_url = f"https://manthan2876-civicconnect-classifier.hf.space/run/predict"
        headers = {}
        if HF_TOKEN:
            headers['Authorization'] = f"Bearer {HF_TOKEN}"

        # We can construct a data URI or call standard API
        # To avoid large payload size, we can also hit the standard HF API if it's hosted
        # Let's hit the HF Space inference endpoint directly
        api_url = f"https://api-inference.huggingface.co/models/{HF_MODEL_ID}"
        headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}
        response = requests.post(api_url, headers=headers, data=file_bytes, timeout=30)
        response.raise_for_status()
        res_json = response.json()
        
        # Format: [{'label': 'class', 'score': 0.X}, ...]
        predictions = []
        if isinstance(res_json, list):
            predictions = [{'class': p.get('label'), 'confidence': p.get('score', 0)} for p in res_json]
        elif isinstance(res_json, dict) and 'confidences' in res_json:
            predictions = [{'class': p.get('label'), 'confidence': p.get('confidence', 0)} for p in res_json['confidences']]
        return predictions[:3]
    except Exception as e:
        print(f"[HF ERROR] Failed to call HF Space: {e}")
        return []

def call_groq_llm(description, transcription):
    system_msg = """You are a civic infrastructure expert for "Civic Connect".
Your task is to classify citizen reports into the top 3 most likely categories.

PRIMARY CLASSIFICATION CLASSES (Choose ONLY from this list):
- construction_waste
- damaged_sidewalk
- damaged_sign
- dead_animal
- flooding_waterlogging
- garbage_overflow_west_container
- good_road
- illegal_construction
- illegal_parking
- open_manhole
- pothole_road_crack
- powerline_damage
- streetlight_damage
- traffic_light

MAPPING GUIDES:
- "Trash", "garbage", "waste", "rubbish", "piled up", "dump" -> "garbage_overflow_west_container" or "construction_waste"
- "Portal", "Bottle", "pothole", "cracked road", "bump" -> "pothole_road_crack"
- "Leak", "Pipe", "water logging", "overflowing water" -> "flooding_waterlogging" or "open_manhole"
- "Darkness", "Bulb", "lamp", "street light out" -> "streetlight_damage"

Return a JSON object containing "predictions", which is a list of the top 3 categories and confidence scores (must sum to 1.0).
Format strictly as: {"predictions": [{"category": "class_name", "confidence": 0.XX}, ...]}"""

    user_msg = f"""Analyze these citizen inputs:
1. User Description: "{description}"
2. Voice Transcription: "{transcription}" """

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }
    payload = {
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.0
    }
    
    res = requests.post(f"{GROQ_URL}/chat/completions", headers=headers, json=payload, timeout=30)
    res.raise_for_status()
    parsed = res.json()
    raw_content = parsed['choices'][0]['message']['content']
    data = json.loads(raw_content)
    return data.get('predictions', [])

def transcribe_audio(file_bytes):
    try:
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}
        files = {"file": ("audio.mp3", file_bytes, "audio/mpeg")}
        data = {"model": "whisper-large-v3"}
        res = requests.post(f"{GROQ_URL}/audio/transcriptions", headers=headers, files=files, data=data, timeout=30)
        res.raise_for_status()
        return res.json().get('text', '')
    except Exception as e:
        print(f"[GROQ AUDIO ERROR] Failed to transcribe: {e}")
        return ''

def calculate_fusion(image_top3, audio_top3, text_top3):
    weights = {'IMAGE': 0.50, 'AUDIO': 0.30, 'TEXT': 0.20}
    score_map = {}
    total_weight = 0

    def add_modality(top3, wt):
        nonlocal total_weight
        if not top3:
            return
        total_weight += wt
        for item in top3:
            label = item.get('category') or item.get('class') or item.get('label') or 'Other'
            confidence = item.get('confidence') or item.get('score') or 0
            score_map[label] = score_map.get(label, 0) + (confidence * wt)

    add_modality(image_top3, weights['IMAGE'])
    add_modality(audio_top3, weights['AUDIO'])
    add_modality(text_top3, weights['TEXT'])

    sorted_results = sorted(
        [{'category': k, 'normalizedScore': v / total_weight if total_weight > 0 else 0} for k, v in score_map.items()],
        key=lambda x: x['normalizedScore'],
        reverse=True
    )
    
    winner = sorted_results[0] if sorted_results else {'category': 'Other', 'normalizedScore': 0}
    runner_up = sorted_results[1] if len(sorted_results) > 1 else {'category': 'Other', 'normalizedScore': 0}
    margin = winner['normalizedScore'] - runner_up['normalizedScore']
    
    return {
        'finalCategory': winner['category'],
        'fusionScore': winner['normalizedScore'],
        'marginOfVictory': margin,
        'needsHumanReview': margin < 0.15 and winner['normalizedScore'] < 0.7
    }

def process_job(job):
    job_id = job['id']
    print(f"\n--- Processing Job {job_id} ---")
    
    # Update attempt count and status
    supabase.table('processing_jobs').update({
        'status': 'processing', 
        'attempts': job['attempts'] + 1
    }).eq('id', job_id).execute()
    
    try:
        # Download files from S3
        image_bytes = None
        if job.get('image_s3_key'):
            try:
                print(f"Downloading S3 Image: {job['image_s3_key']}")
                obj = s3.get_object(Bucket=BUCKET, Key=job['image_s3_key'])
                image_bytes = obj['Body'].read()
            except Exception as e:
                print(f"[S3 WARNING] Failed to download image from S3, continuing without image. Error: {e}")

        audio_bytes = None
        if job.get('audio_s3_key'):
            try:
                print(f"Downloading S3 Audio: {job['audio_s3_key']}")
                obj = s3.get_object(Bucket=BUCKET, Key=job['audio_s3_key'])
                audio_bytes = obj['Body'].read()
            except Exception as e:
                print(f"[S3 WARNING] Failed to download audio from S3, continuing without audio. Error: {e}")

        # Call HF
        image_top3 = []
        if image_bytes:
            image_top3 = get_gradio_predictions(image_bytes)

        # Call Groq Whisper
        audio_text = ""
        if audio_bytes and GROQ_API_KEY:
            audio_text = transcribe_audio(audio_bytes)

        # Call Groq Llama
        text_top3 = []
        if job.get('description') and GROQ_API_KEY:
            text_top3 = call_groq_llm(job['description'], "")

        audio_top3 = []
        if audio_text and GROQ_API_KEY:
            audio_top3 = call_groq_llm("", audio_text)

        print(f"Debug classification for Job {job_id}:")
        print(f"  - image_top3: {image_top3}")
        print(f"  - text_top3: {text_top3}")
        print(f"  - audio_top3: {audio_top3}")

        # Compute Fusion
        fusion_result = calculate_fusion(image_top3, audio_top3, text_top3)
        print(f"  - fusion_result: {fusion_result}")
        
        ai_result_json = {
            'finalCategory': fusion_result['finalCategory'],
            'fusionScore': fusion_result['fusionScore'],
            'needsHumanReview': fusion_result['needsHumanReview'],
            'imageTop3': image_top3,
            'audioTop3': audio_top3,
            'textTop3': text_top3,
            'audioText': audio_text
        }

        # Commit to Postgres via RPC
        print(f"Committing AI results to RPC: {ai_result_json['finalCategory']}")
        rpc_res = supabase.rpc('process_issue_ai_results', {
            'p_job_id': job_id,
            'p_ai_result': ai_result_json
        }).execute()
        
        print(f"Commit success: {rpc_res.data}")

    except Exception as e:
        print(f"[JOB FAILURE] Job {job_id} failed: {e}")
        status = 'failed' if job['attempts'] >= MAX_RETRIES - 1 else 'pending'
        supabase.table('processing_jobs').update({
            'status': status,
            'error': str(e)
        }).eq('id', job_id).execute()

if __name__ == '__main__':
    # Fetch pending/failed jobs
    jobs = supabase.table('processing_jobs') \
        .select('*') \
        .in_('status', ['pending', 'failed']) \
        .lt('attempts', MAX_RETRIES) \
        .execute().data
        
    print(f"Found {len(jobs)} pending jobs to process.")
    for job in jobs:
        process_job(job)
    print("Batch processing execution completed.")
