import os
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sqlalchemy import create_engine
import joblib
import warnings
warnings.filterwarnings('ignore', category=FutureWarning)

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_9btheHapkA5U@ep-holy-credit-a1u14hmv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
)

if "postgresql" in DATABASE_URL:
    conn_str = DATABASE_URL.replace("postgres://", "postgresql://")
else:
    db_path = os.path.join(os.path.dirname(__file__), '../backend/local.db')
    conn_str = f"sqlite:///{db_path}"

def create_features(df):
    """Feature engineering from raw telemetry data."""
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['day'] = df['timestamp'].dt.dayofweek
    
    # Rolling mean (3-period) for trend detection
    df['rolling_mean'] = df['consumption'].shift(1).rolling(3, min_periods=1).mean()
    df = df.bfill().fillna(0)
    return df

def execute_retraining_loop():
    """Retrain models from production database."""
    print("[ML_TRAIN] Connecting to database...")
    
    try:
        engine = create_engine(conn_str)
    except Exception as e:
        print(f"[TRAIN_ERROR] Engine creation failed: {e}")
        return False
    
    try:
        # Try training_records table first (new schema)
        try:
            df = pd.read_sql("SELECT timestamp, consumption, solar, temperature, hour, \"dayOfWeek\" as day, \"rollingMean\" as rolling_mean FROM \"TrainingRecord\" ORDER BY timestamp ASC", engine)
            if len(df) >= 5:
                print(f"[ML_TRAIN] Using TrainingRecord table: {len(df)} rows")
                X = df[['hour', 'day', 'temperature', 'solar', 'rolling_mean']]
                y = df['consumption']
            else:
                raise ValueError("Insufficient TrainingRecord data")
        except Exception:
            # Fallback: try energy_data table (legacy)
            try:
                df = pd.read_sql("SELECT * FROM energy_data ORDER BY timestamp ASC", engine)
                if len(df) >= 5:
                    df = create_features(df)
                    X = df[['hour', 'day', 'temperature', 'solar', 'rolling_mean']]
                    y = df['consumption']
                    print(f"[ML_TRAIN] Using energy_data table: {len(df)} rows")
                else:
                    raise ValueError("Insufficient data")
            except Exception as inner_e:
                print(f"[TRAIN_ABORTED] No sufficient data source: {inner_e}")
                return False
    except Exception as e:
        print(f"[TRAIN_ERROR] Data extraction failed: {e}")
        return False
    
    if len(df) < 5:
        print("[TRAIN_ABORTED] Minimum 5 records required.")
        return False
    
    # Train models
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_model.fit(X, y)
    
    iso_model = IsolationForest(contamination=0.1, random_state=42)
    iso_model.fit(X)
    
    # Save
    base_dir = os.path.dirname(__file__)
    joblib.dump(rf_model, os.path.join(base_dir, 'rf_model.pkl'))
    joblib.dump(iso_model, os.path.join(base_dir, 'iso_model.pkl'))
    
    print(f"[ML_TRAIN] Success: trained on {len(df)} records, saved to disk.")
    return True

if __name__ == "__main__":
    execute_retraining_loop()
