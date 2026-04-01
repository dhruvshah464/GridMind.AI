import random

def fetch_energy_grid():
    # Simulate pulling Central Electricity Authority / POSOCO smart grid parameters
    # Generates dynamic usage values (kWh) tracking natural day/night load curves
    
    hour = __import__('datetime').datetime.now().hour
    
    # Base load logic
    if 18 <= hour <= 23:
        # Evening Peak Grid Demand
        consumption = random.uniform(40.0, 65.0)
    elif 1 <= hour <= 5:
        # Off-Peak Minimum Grid Demand
        consumption = random.uniform(15.0, 25.0)
    else:
        # Daytime Standard Operation
        consumption = random.uniform(28.0, 42.0)
        
    return {
        "consumption": round(consumption, 2)
    }

if __name__ == "__main__":
    print(fetch_energy_grid())
