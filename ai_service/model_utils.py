import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import os

class CivicClassifier:
    """Production fine-tuned MobileNetV2 with 14 classes."""
    def __init__(self, model_path: str, device: torch.device):
        self.device = device
        
        # Standard 14 classes as confirmed by testing
        self.class_names = [
            'construction_waste', 'damaged_sidewalk', 'damaged_sign', 'dead_animal', 
            'flooding_waterlogging', 'garbage_overflow_west_container', 'good_road', 
            'illegal_construction', 'illegal_parking', 'open_manhole', 
            'pothole_road_crack', 'powerline_damage', 'streetlight_damage', 'traffic_light'
        ]
        self.num_classes = len(self.class_names)


        
        # Recreate the MobileNetV2 architecture used in training
        self.model = models.mobilenet_v2(weights=None)
        self.model.classifier[1] = nn.Linear(self.model.last_channel, self.num_classes)
        
        # Load the finetuned state dict
        # Note: Using weights_only=True for safety if available in future
        state_dict = torch.load(model_path, map_location=self.device)
        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ])

    def predict(self, image_bytes: bytes):
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            
            # Get Top 3
            top_probs, top_indices = torch.topk(probabilities, 3)
            
        top_results = []
        for i in range(len(top_probs)):
            top_results.append({
                "class": self.class_names[top_indices[i].item()],
                "confidence": float(top_probs[i].item())
            })

        return {
            "class": top_results[0]["class"],
            "confidence": top_results[0]["confidence"],
            "top_3": top_results
        }

