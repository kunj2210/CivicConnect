# CivicConnect Model Card

## CivicConnect hosted multimodal classifier

### Intended use

The classifier assists automated civic-report verification by analyzing an
uploaded image. It is a triage signal for the backend workflow, not a final
decision about a resident, neighborhood, department, or public-service
priority.

### Inputs and outputs

- `/classify`: an image accepted by the AI service upload validation.
- `/transcribe`: an audio complaint and an optional language hint.
- `/classify_text`: a complaint description or transcript.
- Output: a top-3 civic class ranking for classification endpoints, or
  transcript text for audio.
- Consumer: backend AI integration, WhatsApp processing, and the
  processing-job workflow.

The hosted Space uses a PyTorch MobileNetV2 image model, Whisper for audio,
and zero-shot DeBERTa for text. The application preserves these 14 classes:
`construction_waste`, `damaged_sidewalk`, `damaged_sign`, `dead_animal`,
`flooding_waterlogging`, `garbage_overflow_west_container`, `good_road`,
`illegal_construction`, `illegal_parking`, `open_manhole`,
`pothole_road_crack`, `powerline_damage`, `streetlight_damage`, and
`traffic_light`.

### Limitations

Performance may vary with lighting, blur, occlusion, image quality, unusual
objects, language, accent, transcript quality, cold starts, and categories
that were not represented in training data. A confidence score is not proof
of correctness. Low-confidence, contradictory, malformed, or unavailable
predictions must retain a human-review or retry path.

### Safety and privacy

Do not use the model to infer sensitive personal attributes. Remove unnecessary
metadata, restrict media access, use expiring URLs where supported, and apply
retention rules to uploaded images and derived predictions.

### Evaluation record

Before a model release, record the model identifier, training-data provenance,
class definitions, validation split, per-class metrics, calibration or
threshold decisions, known failure cases, and rollback artifact. This section
must be updated from measured CivicConnect evaluation results rather than
invented benchmark values.
