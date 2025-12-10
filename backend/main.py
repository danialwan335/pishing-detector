import joblib
import numpy as np
import os
import time
import cv2
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

app = FastAPI(title="Pishing Detector API")

# Supabase Configuration
SUPABASE_URL = "https://lzncmebhvthpmantdwbq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6bmNtZWJodnRocG1hbnRkd2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMjcxNzUsImV4cCI6MjA4MDkwMzE3NX0.xSPvU2LPDOLVN9RocBxMdeMVK3aFE7R13L37n6tD5wM"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "phishing_model.pkl")
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("ML Model loaded successfully")
else:
    model = None
    print("Warning: ML Model not found. Train usage train_model.py")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    url: str

class ScanResponse(BaseModel):
    url: str
    is_phishing: bool
    confidence: float
    message: str
    scan_duration: float

def extract_features(url):
    # MUST match train_model.py
    features = []
    keywords = ["login", "verify", "secure", "account", "update", "bank", "signin", "password", "confirm"]
    
    features.append(len(url))
    features.append(url.count('.'))
    features.append(url.count('-'))
    features.append(url.count('@'))
    features.append(1 if "https" in url else 0)
    features.append(sum(c.isdigit() for c in url))
    features.append(sum(1 for k in keywords if k in url.lower()))
    
    return np.array(features).reshape(1, -1)

def analyze_url(url: str):
    start_time = time.time()
    features = extract_features(url)
    
    if model:
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        is_phishing = bool(prediction == 1)
        confidence = float(probabilities[1] if is_phishing else probabilities[0])
    else:
        is_phishing = False
        confidence = 0.0

    duration = time.time() - start_time
    
    
    if is_phishing:
        msg = "DANGER: AI-driven analysis detected phishing patterns."
    else:
        msg = "SAFE: No malicious patterns detected by AI."

    # Save to Supabase
    try:
        data = {
            "url": url,
            "is_phishing": is_phishing,
            "confidence": float(confidence),
            "scan_duration": float(duration)
        }
        supabase.table("scan_history").insert(data).execute()
        print(f"Scan saved to DB: {url}")
    except Exception as e:
        print(f"Failed to save to Supabase: {e}")
        
    return ScanResponse(
        url=url,
        is_phishing=is_phishing,
        confidence=round(confidence, 4),
        message=msg,
        scan_duration=round(duration, 2)
    )

@app.get("/")
def read_root():
    return {"status": "online", "message": "ScamShield Backend is Running (ML + QR Enabled)"}

@app.post("/api/scan", response_model=ScanResponse)
async def scan_url(request: ScanRequest):
    return analyze_url(request.url)

@app.post("/api/scan/qr", response_model=ScanResponse)
async def scan_qr(file: UploadFile = File(...)):
    # Read image file
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Decode QR Code
    detector = cv2.QRCodeDetector()
    data, bbox, _ = detector.detectAndDecode(image)
    
    if not data:
        raise HTTPException(status_code=400, detail="No QR code found in image")
        
    return analyze_url(data)

@app.get("/api/history")
async def get_history():
    try:
        response = supabase.table("scan_history").select("*").order("created_at", desc=True).limit(20).execute()
        return response.data
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
