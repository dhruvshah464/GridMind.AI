const axios = require('axios');
const prisma = require('../models');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Region → coordinates mapping
const REGION_COORDS = {
  'California':  { lat: 34.05, lon: -118.25 },
  'Texas':       { lat: 30.27, lon: -97.74 },
  'New York':    { lat: 40.71, lon: -74.01 },
  'Florida':     { lat: 25.76, lon: -80.19 },
  'Mumbai':      { lat: 19.08, lon: 72.88 },
  'Delhi':       { lat: 28.61, lon: 77.21 },
  'Bangalore':   { lat: 12.97, lon: 77.59 },
  'London':      { lat: 51.51, lon: -0.13 },
  'Singapore':   { lat: 1.35,  lon: 103.82 },
};

class WeatherService {
  /**
   * Fetch current weather for a region. Uses DB cache (1h TTL).
   */
  static async getCurrentWeather(region) {
    const cacheKey = region || 'California';
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check cache first
    try {
      const cached = await prisma.weatherCache.findFirst({
        where: {
          region: cacheKey,
          fetchedAt: { gte: oneHourAgo }
        },
        orderBy: { fetchedAt: 'desc' }
      });

      if (cached) {
        return {
          temperature: cached.temperature,
          cloudCover: cached.cloudCover,
          solarRadiation: cached.solarRadiation || WeatherService._estimateSolarFromCloud(cached.cloudCover),
          humidity: cached.humidity,
          windSpeed: cached.windSpeed,
          region: cached.region,
          cached: true
        };
      }
    } catch (e) {
      // Cache miss, proceed to API
    }

    // Fetch from OpenWeatherMap
    const coords = REGION_COORDS[cacheKey] || REGION_COORDS['California'];

    if (!WEATHER_API_KEY || WEATHER_API_KEY === '') {
      return WeatherService._getFallbackWeather(cacheKey);
    }

    try {
      const res = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat: coords.lat,
          lon: coords.lon,
          appid: WEATHER_API_KEY,
          units: 'metric'
        },
        timeout: 5000
      });

      const data = res.data;
      const weather = {
        temperature: data.main.temp,
        cloudCover: data.clouds.all,
        solarRadiation: WeatherService._estimateSolarFromCloud(data.clouds.all),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        region: cacheKey,
        cached: false
      };

      // Persist to cache
      try {
        await prisma.weatherCache.upsert({
          where: {
            region_date: {
              region: cacheKey,
              date: new Date(new Date().toDateString())
            }
          },
          update: {
            temperature: weather.temperature,
            cloudCover: weather.cloudCover,
            solarRadiation: weather.solarRadiation,
            humidity: weather.humidity,
            windSpeed: weather.windSpeed,
            fetchedAt: new Date()
          },
          create: {
            region: cacheKey,
            date: new Date(new Date().toDateString()),
            temperature: weather.temperature,
            cloudCover: weather.cloudCover,
            solarRadiation: weather.solarRadiation,
            humidity: weather.humidity,
            windSpeed: weather.windSpeed
          }
        });
      } catch (dbErr) {
        console.warn('[WEATHER] Cache write failed:', dbErr.message);
      }

      return weather;
    } catch (err) {
      console.warn('[WEATHER] API fetch failed:', err.message);
      return WeatherService._getFallbackWeather(cacheKey);
    }
  }

  /**
   * Estimate solar radiation from cloud cover (0-100%)
   * Returns W/m² estimate
   */
  static _estimateSolarFromCloud(cloudPercent) {
    const maxSolar = 1000; // Peak W/m² on clear day
    const hour = new Date().getHours();
    
    // Solar curve: peak at noon, zero at night
    let solarFactor = 0;
    if (hour >= 6 && hour <= 18) {
      solarFactor = Math.sin(((hour - 6) / 12) * Math.PI);
    }
    
    const cloudFactor = 1 - (cloudPercent / 100) * 0.75; // Clouds reduce by up to 75%
    return Math.round(maxSolar * solarFactor * cloudFactor);
  }

  static _getFallbackWeather(region) {
    const hour = new Date().getHours();
    return {
      temperature: 28 + Math.sin(hour / 6) * 5,
      cloudCover: 30,
      solarRadiation: WeatherService._estimateSolarFromCloud(30),
      humidity: 55,
      windSpeed: 3.5,
      region,
      cached: false,
      fallback: true
    };
  }
}

module.exports = WeatherService;
