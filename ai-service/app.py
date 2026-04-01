from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List
import os
import joblib
import numpy as np
from train import execute_retraining_loop

app = FastAPI(title="GridMind.AI ML Service", version="2.0.0")

# Model singletons
rf_model = None
iso_model = None

def load_models():
    global rf_model, iso_model
    base_dir = os.path.dirname(__file__)
    rf_path = os.path.join(base_dir, 'rf_model.pkl')
    iso_path = os.path.join(base_dir, 'iso_model.pkl')
    
    if os.path.exists(rf_path) and os.path.exists(iso_path):
        rf_model = joblib.load(rf_path)
        iso_model = joblib.load(iso_path)
        print("[ML] Models loaded successfully")
    else:
        print("[ML] Models not found. Starting initial training...")
        if execute_retraining_loop():
            rf_model = joblib.load(rf_path)
            iso_model = joblib.load(iso_path)
        else:
            print("[ML] Training failed. Using heuristic fallback.")

@app.on_event("startup")
def startup_event():
    load_models()

class MLRequest(BaseModel):
    hour: int = 18
    day: int = 2
    temperature: float = 30.0
    solar_radiation: float = 0.0
    pastUsage: List[float] = [20.0, 25.0, 30.0, 28.0]

@app.post("/predict")
def predict_usage(data: MLRequest):
    # Calculate rolling mean from past usage (feature engineering)
    if len(data.pastUsage) > 0:
        rolling_mean = sum(data.pastUsage[-3:]) / min(len(data.pastUsage), 3)
    else:
        rolling_mean = 0.0
    
    # 5 features: hour, day, temperature, solar_radiation, rolling_mean
    features = [[data.hour, data.day, data.temperature, data.solar_radiation, rolling_mean]]
    
    if rf_model is None or iso_model is None:
        # Heuristic fallback
        avg_usage = sum(data.pastUsage) / len(data.pastUsage) if data.pastUsage else 35.0
        peak_hour = "6PM-9PM"
        if data.hour >= 7 and data.hour <= 9:
            peak_hour = "7AM-9AM"
        elif data.hour >= 12 and data.hour <= 14:
            peak_hour = "12PM-2PM"
        
        return {
            "predictedUsage": round(avg_usage, 2),
            "peakHour": peak_hour,
            "confidence": 0.55,
            "anomaly": {"status": False, "severity": "none"}
        }

    # Model prediction
    pred_val = float(rf_model.predict(features)[0])
    is_anomaly = bool(iso_model.predict(features)[0] == -1)
    
    # Confidence from forest variance
    preds = [tree.predict(features)[0] for tree in rf_model.estimators_]
    std_dev = float(np.std(preds))
    conf = max(0.40, min(0.98, 1.0 - (std_dev / (pred_val + 1e-5))))
    
    # Determine peak hour label
    peak_hour = "6PM-9PM"
    if data.hour >= 7 and data.hour <= 9:
        peak_hour = "7AM-9AM (Morning)"
    elif data.hour >= 17 and data.hour <= 21:
        peak_hour = "5PM-9PM (Evening)"
    
    return {
        "predictedUsage": round(pred_val, 2),
        "peakHour": peak_hour,
        "confidence": round(conf, 2),
        "anomaly": {
            "status": is_anomaly, 
            "severity": "high" if is_anomaly else "none"
        }
    }

@app.post("/retrain")
def trigger_retrain(background_tasks: BackgroundTasks):
    def background_train():
        execute_retraining_loop()
        load_models()
    background_tasks.add_task(background_train)
    return {"status": "Retraining initiated", "message": "Models will be updated in background."}

@app.get("/health")
def health():
    return {
        "status": "OK",
        "service": "GridMind.AI ML Engine",
        "models_loaded": rf_model is not None and iso_model is not None
    }
