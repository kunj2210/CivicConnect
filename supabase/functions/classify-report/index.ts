import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client, handle_file } from "https://esm.sh/@gradio/client@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE') || '';
const HF_TOKEN = Deno.env.get('HF_TOKEN') || '';
const HF_SPACE_ID = Deno.env.get('HF_SPACE_ID') || 'manthan2876/CivicConnect-Classifier';
const GROQ_API_KEY = Deno.env.get('OPEN_SOURCE_LLM_KEY') || '';
const GROQ_URL = Deno.env.get('OPEN_SOURCE_LLM_URL') || 'https://api.groq.com/openai/v1';
const LLM_MODEL = Deno.env.get('LLM_MODEL') || 'llama-3.1-8b-instant';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { job_id } = await req.json();
    if (!job_id) {
      return new Response(JSON.stringify({ error: "Missing job_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[EDGE FUNCTION] Processing job ${job_id}...`);

    // 1. Fetch the job details
    const { data: job, error: jobErr } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (jobErr || !job) {
      console.error("[EDGE FUNCTION] Job not found:", jobErr);
      return new Response(JSON.stringify({ error: "Job not found" }), { status: 404 });
    }

    // Guard: only process if status is pending or failed
    if (job.status !== 'pending' && job.status !== 'failed') {
      console.log(`[EDGE FUNCTION] Job ${job_id} already has status: ${job.status}. Skipping.`);
      return new Response(JSON.stringify({ message: "Already processed" }), { status: 200 });
    }

    // 2. Mark job as processing
    await supabase
      .from('processing_jobs')
      .update({ status: 'processing', attempts: job.attempts + 1 })
      .eq('id', job_id);

    // 3. Process Image Classification (if image exists)
    let imageTop3: any[] = [];
    if (job.image_get_url) {
      try {
        console.log(`[EDGE FUNCTION] Fetching image from: ${job.image_get_url}`);
        const imgResponse = await fetch(job.image_get_url);
        if (!imgResponse.ok) {
          throw new Error(`Failed to fetch image: HTTP ${imgResponse.status} ${imgResponse.statusText}`);
        }
        const imgBlob = await imgResponse.blob();
        
        console.log(`[EDGE FUNCTION] Connecting to Hugging Face Space: ${HF_SPACE_ID}...`);
        const gradioClient = await Client.connect(HF_SPACE_ID, HF_TOKEN ? { token: HF_TOKEN } as any : {});
        console.log("[EDGE FUNCTION] Connected. Calling predict...");
        
        const fileObj = new File([imgBlob], "report_image.jpg", { type: "image/jpeg" });
        const prediction: any = await gradioClient.predict("/classify", {
          image: handle_file(fileObj)
        });

        if (prediction && prediction.data && Array.isArray(prediction.data) && prediction.data.length > 0) {
          const labelData = prediction.data[0];
          if (labelData && Array.isArray(labelData.confidences)) {
            imageTop3 = labelData.confidences.map((item: any) => ({
              class: item.label,
              confidence: item.confidence
            }));
          }
        }
        console.log("[EDGE FUNCTION] Image classification completed. Top 3:", imageTop3);
      } catch (err: any) {
        console.error("[EDGE FUNCTION] Image classification error:", err.message);
      }
    }

    // 4. Process Audio Transcription (if audio exists)
    let audioText = "";
    if (job.audio_get_url && GROQ_API_KEY) {
      try {
        console.log(`[EDGE FUNCTION] Fetching audio from: ${job.audio_get_url}`);
        const audioResponse = await fetch(job.audio_get_url);
        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch audio: HTTP ${audioResponse.status} ${audioResponse.statusText}`);
        }
        const audioBlob = await audioResponse.blob();

        console.log("[EDGE FUNCTION] Transcribing audio via Groq Whisper...");
        const audioFormData = new FormData();
        audioFormData.append("file", audioBlob, "audio.mp3");
        audioFormData.append("model", "whisper-large-v3");

        const groqTransRes = await fetch(`${GROQ_URL}/audio/transcriptions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
          },
          body: audioFormData
        });

        if (groqTransRes.ok) {
          const transcription = await groqTransRes.json();
          audioText = transcription.text || "";
          console.log(`[EDGE FUNCTION] Audio transcription: "${audioText}"`);
        } else {
          console.error("[EDGE FUNCTION] Audio transcription request failed status:", groqTransRes.status);
        }
      } catch (err: any) {
        console.error("[EDGE FUNCTION] Audio transcription error:", err.message);
      }
    }

    // 5. LLM Standardization & Fusion
    let textTop3: any[] = [];
    if (job.description && GROQ_API_KEY) {
      try {
        textTop3 = await callGroqLLM(job.description, "", GROQ_API_KEY);
      } catch (err: any) {
        console.error("[EDGE FUNCTION] Text standardization failed:", err.message);
      }
    }

    let audioTop3: any[] = [];
    if (audioText && GROQ_API_KEY) {
      try {
        audioTop3 = await callGroqLLM("", audioText, GROQ_API_KEY);
      } catch (err: any) {
        console.error("[EDGE FUNCTION] Audio standardization failed:", err.message);
      }
    }

    // 6. Perform Fusion Logic
    const fusionResult = calculateAdvancedFusion(imageTop3, audioTop3, textTop3);

    // 7. Invoke Stored RPC to commit results
    const aiResultJson = {
      finalCategory: fusionResult.finalCategory,
      fusionScore: fusionResult.fusionScore,
      needsHumanReview: fusionResult.needsHumanReview,
      imageTop3: imageTop3,
      audioTop3: audioTop3,
      textTop3: textTop3,
      audioText: audioText
    };

    console.log("[EDGE FUNCTION] Calling Database RPC with results:", JSON.stringify(aiResultJson));
    
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('process_issue_ai_results', {
      p_job_id: job_id,
      p_ai_result: aiResultJson
    });

    if (rpcErr) {
      console.error("[EDGE FUNCTION] RPC Error:", rpcErr);
      throw new Error(`RPC failed: ${rpcErr.message}`);
    }

    console.log("[EDGE FUNCTION] Job processed successfully. RPC response:", rpcRes);

    return new Response(JSON.stringify({ success: true, db_response: rpcRes }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[EDGE FUNCTION ERROR]:", error.message);
    
    try {
      const body = await req.clone().json();
      if (body.job_id) {
        await supabase
          .from('processing_jobs')
          .update({ status: 'failed', error: error.message })
          .eq('id', body.job_id);
      }
    } catch (dbErr) {
      console.error("[EDGE FUNCTION] Failed to update error status in DB:", dbErr);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

async function callGroqLLM(description: string, transcription: string, groqKey: string): Promise<any[]> {
  const systemMsg = `You are a civic infrastructure expert for "Civic Connect".
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
Format strictly as: {"predictions": [{"category": "class_name", "confidence": 0.XX}, ...]}`;

  const userMsg = `Analyze these citizen inputs:
1. User Description: "${description}"
2. Voice Transcription: "${transcription}"`;

  const response = await fetch(`${GROQ_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqKey}`
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg }
      ],
      response_format: { type: "json_object" },
      temperature: 0
    })
  });

  if (!response.ok) {
    throw new Error(`Groq LLM API returned status ${response.status}`);
  }

  const result = await response.json();
  const rawJson = result.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(rawJson);
  return parsed.predictions || parsed.results || parsed.categories || (Array.isArray(parsed) ? parsed : [parsed]);
}

function calculateAdvancedFusion(imageTop3: any[], audioTop3: any[], textTop3: any[]): any {
  const MODALITY_WEIGHTS = { IMAGE: 0.50, AUDIO: 0.30, TEXT: 0.20 };
  const scoreMap: Record<string, number> = {};
  let totalWeightUsed = 0;

  const processModality = (top3Array: any[], weight: number) => {
    if (!top3Array || !Array.isArray(top3Array) || top3Array.length === 0) return;
    totalWeightUsed += weight;
    top3Array.forEach(p => {
      const rawClass = p.category || p.class || p.label || 'Other';
      if (!scoreMap[rawClass]) scoreMap[rawClass] = 0;
      scoreMap[rawClass] += ((p.confidence || p.score || 0) * weight);
    });
  };

  processModality(imageTop3, MODALITY_WEIGHTS.IMAGE);
  processModality(audioTop3, MODALITY_WEIGHTS.AUDIO);
  processModality(textTop3, MODALITY_WEIGHTS.TEXT);

  const sorted = Object.entries(scoreMap)
    .map(([category, score]) => ({ 
      category, 
      score, 
      normalizedScore: totalWeightUsed > 0 ? (score / totalWeightUsed) : 0 
    }))
    .sort((a, b) => b.score - a.score);

  const winner = sorted[0] || { category: 'Other', score: 0, normalizedScore: 0 };
  const runnerUp = sorted[1] || { category: 'Other', score: 0, normalizedScore: 0 };
  const marginOfVictory = winner.normalizedScore - runnerUp.normalizedScore;

  return {
    finalCategory: winner.category,
    fusionScore: winner.normalizedScore,
    marginOfVictory,
    needsHumanReview: marginOfVictory < 0.15 && winner.normalizedScore < 0.7
  };
}
