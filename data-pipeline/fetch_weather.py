import requests
import random

# OpenWeatherMap Mock Fallback or Real API Integration
# In production, use os.environ.get("OPENWEATHER_API_KEY")
API_KEY = "dummy_key"

def fetch_weather(city="Ahmedabad"):
    # Since API_KEY is missing, we simulate real meteorological traces based on time bounds
    # A true integration would return `res = requests.get(url).json()` mapping main.temp
    
    # Simulate Indian climate context (28C to 42C)
    base_temp = random.uniform(28.0, 42.0)
    
    # Simulate solar trace (Lux) mapping daytime spikes
    # 0 = night, 1000 = peak solar irradiation
    hour = __import__('datetime').datetime.now().hour
    if 6 <= hour <= 18:
        solar_irradiance = random.uniform(300.0, 950.0)
    else:
        solar_irradiance = 0.0

    return {
        "temperature": round(base_temp, 2),
        "solar": round(solar_irradiance, 2)
    }

if __name__ == "__main__":
    print(fetch_weather())
