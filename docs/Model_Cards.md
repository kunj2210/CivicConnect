# CivicConnect Model Card

## CivicConnect image classifier

### Intended use

The classifier assists automated civic-report verification by analyzing an
uploaded image. It is a triage signal for the backend workflow, not a final
decision about a resident, neighborhood, department, or public-service
priority.

### Inputs and outputs

- Input: an image accepted by the AI service upload validation.
- Output: predicted class and confidence, with optional top alternatives.
- Consumer: backend AI integration and processing-job workflow.

### Limitations

Performance may vary with lighting, blur, occlusion, image quality, unusual
objects, and categories that were not represented in training data. A
confidence score is not proof of correctness. Low-confidence, contradictory,
or unavailable predictions must retain a human-review or fallback path.

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
