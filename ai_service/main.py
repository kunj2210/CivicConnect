from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import torch
from contextlib import asynccontextmanager

# Model Path
PRODUCTION_MODEL_PATH = os.path.join("..", "AI-Related-Files", "CivicConnect_Production_Model.pth")

# Global model instance
classifier = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global classifier
    
    # 1. Load Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # 2. Load Production Model
    from model_utils import CivicClassifier
    
    try:
        print(f"Loading Production Model from {PRODUCTION_MODEL_PATH}...")
        classifier = CivicClassifier(PRODUCTION_MODEL_PATH, device)
        print("Production Model loaded successfully!")
    except Exception as e:
        print(f"ERROR loading model: {e}")
        
    yield
    # Cleanup
    classifier = None

app = FastAPI(lifespan=lifespan)

@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    """Receives an image and returns predictions from the production model."""
    if classifier is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    try:
        image_bytes = await file.read()
        result = classifier.predict(image_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
