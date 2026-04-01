import time
import requests
from datetime import datetime
from fetch_weather import fetch_weather
from fetch_energy import fetch_energy_grid
from db import insert_energy_data

THRESHOLD_ROWS = 24  # Number of inserts before triggering the continuous loop

def run_scheduler():
    points_since_retrain = 0
    print("[SCHEDULER] Live Data Pipeline Activated. Fetching metrics globally.")

    while True:
        try:
            weather = fetch_weather()
            energy = fetch_energy_grid()
            timestamp = datetime.now().isoformat()
            
            # Step 1: Storage Layer (Hybrid SQLite / Postgres logic executed autonomously)
            insert_energy_data(timestamp, energy["consumption"], weather["solar"], weather["temperature"])
            
            # Step 2: Automation Loop Check
            points_since_retrain += 1
            if points_since_retrain >= THRESHOLD_ROWS:
                print("[SCHEDULER] Minimum threshold surpassed. Requesting automated Model Retrain.")
                res = requests.post("http://localhost:8000/retrain")
                print(f"[SCHEDULER] Retrain Status: {res.json()}")
                points_since_retrain = 0

            # Default to polling every 3600s (1 hour) matching standard Grid Data ticks
            # Set to 10 for rapid demo visualization.
            time.sleep(3600)

        except Exception as e:
            print(f"[CRITICAL_SCHEDULER_FAULT] Engine skipping tick: {e}")
            time.sleep(60)

if __name__ == "__main__":
    run_scheduler()
