import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest

# 5 features: hour, day, temperature, solar_radiation, rolling_mean
rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
iso_model = IsolationForest(contamination=0.1, random_state=42)

def train_models():
    """Train with synthetic 5-feature data matching the API contract."""
    X = np.array([
        [18, 2, 32, 0,   28],   # Evening, hot, no solar
        [12, 1, 28, 500, 18],   # Noon, moderate, high solar
        [8,  3, 20, 200, 13],   # Morning, cool, some solar
        [22, 4, 15, 0,   30],   # Late night, cold
        [19, 2, 30, 0,   30],   # Evening peak
        [9,  1, 22, 350, 15],   # Morning, solar starting
        [14, 3, 33, 800, 24],   # Afternoon, max solar
        [2,  5, 10, 0,   6],    # Deep night
        [6,  0, 18, 50,  8],    # Early morning
        [20, 6, 25, 0,   32],   # Weekend evening
        [16, 1, 35, 400, 25],   # Pre-peak, hot
        [23, 3, 12, 0,   20],   # Late night
    ])
    y_usage = np.array([35, 25, 18, 15, 40, 20, 30, 5, 10, 38, 28, 12])

    rf_model.fit(X, y_usage)
    iso_model.fit(X)

def predict(features):
    """Predict usage and confidence for a 5-feature input."""
    pred_val = rf_model.predict([features])[0]
    
    preds = [tree.predict([features])[0] for tree in rf_model.estimators_]
    std_dev = np.std(preds)
    raw_conf = 1.0 - (std_dev / (pred_val + 1e-5))
    conf = max(0.40, min(0.98, raw_conf))
    
    return float(pred_val), float(conf)

def detect_anomaly(features):
    """Detect anomalies via Isolation Forest. -1 = anomaly."""
    res = iso_model.predict([features])[0]
    return bool(res == -1)
