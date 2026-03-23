# CivicConnect AI Service

This microservice handles image classification for automated report verification (FR 7).

## Setup Instructions

1. **Prerequisites**: Python 3.9+ installed.
2. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Start the Service**:
   ```bash
   python main.py
   ```
   The service will run on `http://localhost:8000`.

## Testing the API
You can test the classification endpoint using `curl`:
```bash
curl -X POST -F "file=@path/to/your/image.jpg" http://localhost:8000/classify
```

## How it Integrates
- **Backend (Node.js)**: Automatically calls `http://localhost:8000/classify` whenever a new issue is reported with an image.
- **Verification**: If the AI prediction matches the user's category with >65% confidence, the report is marked as "Verified" and its priority score is boosted by 25%.
