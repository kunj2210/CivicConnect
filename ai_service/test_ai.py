import requests
import sys
import os

def test_classify(image_path):
    url = "http://localhost:8000/classify"
    
    if not os.path.exists(image_path):
        print(f"Error: File not found at {image_path}")
        return

    try:
        print(f"Sending {image_path} to AI service...")
        with open(image_path, "rb") as f:
            files = {"file": f}
            response = requests.post(url, files=files)
        
        response.raise_for_status()
        result = response.json()
        
        print("\n--- AI Classification Result ---")
        print(f"Top Prediction: {result.get('class', 'unknown')}")
        print(f"Confidence:     {result.get('confidence', 0) * 100:.2f}%")
        
        if 'top_3' in result:
            print("\nTop-3 Breakdown:")
            for i, item in enumerate(result['top_3']):
                print(f"  {i+1}. {item['class']} ({item['confidence']*100:.2f}%)")
        print("--------------------------------\n")
        
    except requests.exceptions.ConnectionError:
        print("Error: AI Service is not running. Please start it with 'python main.py' first.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ai.py <path_to_image>")
    else:
        test_classify(sys.argv[1])
