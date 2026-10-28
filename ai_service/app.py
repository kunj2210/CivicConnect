"""CivicConnect multimodal classifier for Hugging Face Spaces.

The Space exposes image classification, voice transcription, and text
classification through the Gradio API endpoints consumed by CivicConnect.
"""
import logging
import os

import gradio as gr
import spaces
import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms
from transformers import pipeline

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("civicconnect-space")

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(HERE, "CivicConnect_Production_Model.pth")
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(
        HERE, "..", "AI-Related-Files", "CivicConnect_Production_Model.pth"
    )
CLASS_NAMES = [
    "construction_waste", "damaged_sidewalk", "damaged_sign", "dead_animal",
    "flooding_waterlogging", "garbage_overflow_west_container", "good_road",
    "illegal_construction", "illegal_parking", "open_manhole",
    "pothole_road_crack", "powerline_damage", "streetlight_damage", "traffic_light",
]
CLASS_DESCRIPTIONS = {
    "construction_waste": "construction debris, rubble or building waste dumped on the street",
    "damaged_sidewalk": "a broken, cracked or damaged sidewalk or footpath",
    "damaged_sign": "a damaged, bent, missing or fallen road sign",
    "dead_animal": "a dead animal on the road or street",
    "flooding_waterlogging": "flooding, waterlogging, water leakage or overflowing water on the road",
    "garbage_overflow_west_container": "overflowing garbage, trash, rubbish or waste bins and containers",
    "good_road": "a road in good condition with no problem",
    "illegal_construction": "illegal or unauthorized construction",
    "illegal_parking": "illegally parked vehicles blocking the road or footpath",
    "open_manhole": "an open, uncovered or missing manhole or drain cover",
    "pothole_road_crack": "a pothole, crack or damage in the road surface",
    "powerline_damage": "damaged, hanging or fallen electric wires or power lines",
    "streetlight_damage": "a street light that is broken, not working or dark",
    "traffic_light": "a traffic signal that is broken or not working",
}
DESCRIPTION_TO_CLASS = {value: key for key, value in CLASS_DESCRIPTIONS.items()}


class ImageClassifier:
    def __init__(self, path):
        model = models.mobilenet_v2(weights=None)
        model.classifier[1] = nn.Linear(model.last_channel, len(CLASS_NAMES))
        model.load_state_dict(torch.load(path, map_location="cpu"))
        model.eval()
        self.model = model
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])

    @torch.inference_mode()
    def predict(self, image, k=3):
        probabilities = self.model(
            self.transform(image.convert("RGB")).unsqueeze(0)
        )[0].softmax(0)
        top = torch.topk(probabilities, k)
        return {CLASS_NAMES[index]: float(score) for score, index in zip(top.values, top.indices)}


image_classifier = ImageClassifier(MODEL_PATH)
asr_models = {}
text_models = {}


def get_pipeline(cache, task, model_name, dtype):
    if model_name not in cache:
        log.info("Loading %s model %s", task, model_name)
        cache[model_name] = pipeline(task, model=model_name, torch_dtype=dtype, device="cpu")
    return cache[model_name]


@spaces.GPU(duration=60)
def transcribe(audio, language="auto"):
    if not audio:
        return ""
    pipe = get_pipeline(asr_models, "automatic-speech-recognition",
                        "openai/whisper-small", torch.float32)
    kwargs = {"task": "transcribe"}
    if language and language != "auto":
        kwargs["language"] = language
    return (pipe(audio, generate_kwargs=kwargs).get("text") or "").strip()


@spaces.GPU(duration=30)
def classify_text(text):
    text = (text or "").strip()
    if not text:
        return {}
    pipe = get_pipeline(text_models, "zero-shot-classification",
                        "MoritzLaurer/deberta-v3-base-zeroshot-v2.0", torch.float32)
    result = pipe(text[:2000], candidate_labels=list(CLASS_DESCRIPTIONS.values()),
                  hypothesis_template="This citizen report is about {}.",
                  multi_label=False)
    return {
        DESCRIPTION_TO_CLASS[label]: float(score)
        for label, score in zip(result["labels"][:3], result["scores"][:3])
    }


with gr.Blocks(title="CivicConnect Classifier") as demo:
    gr.Markdown("# CivicConnect Classifier\nImage, voice and text classification for civic reports.")
    with gr.Tab("Image"):
        image_input = gr.Image(type="pil", label="image")
        image_output = gr.Label(num_top_classes=3)
        gr.Button("Classify").click(image_classifier.predict, image_input, image_output, api_name="classify")
    with gr.Tab("Voice"):
        audio_input = gr.Audio(type="filepath", label="audio")
        language_input = gr.Dropdown(["auto", "en", "hi", "gu"], value="auto", label="language")
        transcript_output = gr.Textbox(label="transcript")
        gr.Button("Transcribe").click(transcribe, [audio_input, language_input],
                                       transcript_output, api_name="transcribe")
    with gr.Tab("Text"):
        text_input = gr.Textbox(label="text", lines=4)
        text_output = gr.Label(num_top_classes=3)
        gr.Button("Classify").click(classify_text, text_input, text_output, api_name="classify_text")

# Disable Gradio SSR's Node proxy. Hugging Face restarts the Space through
# Python, and the proxy can emit invalid-event-loop warnings during shutdown.
demo.queue(max_size=20).launch(ssr_mode=False)
