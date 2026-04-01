/**
 * GridMind.AI — Data Adapter
 * Normalizes raw data from DB, APIs, or external sources into clean format for AI Engine
 */

exports.normalizeEnergyData = (raw) => {
  if (!raw || !raw.timeseries || !Array.isArray(raw.timeseries)) {
    return { usage: [], solar: [], timestamps: [] };
  }

  return {
    usage: raw.timeseries.map(t => typeof t.consumptionKwh === 'number' ? t.consumptionKwh : 0),
    solar: raw.timeseries.map(t => typeof t.solarProdKwh === 'number' ? t.solarProdKwh : 0),
    timestamps: raw.timeseries.map(t => t.timestamp || new Date().toISOString()),
    temperatures: raw.timeseries.map(t => typeof t.temperature === 'number' ? t.temperature : null).filter(Boolean)
  };
};

exports.generateMockTimeseries = (hours = 24) => {
  const now = new Date();
  return Array.from({ length: hours }).map((_, i) => {
    const hour = (now.getHours() - hours + i + 24) % 24;
    // Realistic usage pattern: low at night, peaks at morning & evening
    const baseLoad = 15;
    const morningPeak = hour >= 7 && hour <= 9 ? 20 : 0;
    const eveningPeak = hour >= 17 && hour <= 21 ? 25 : 0;
    const noise = (Math.random() - 0.5) * 8;
    
    const consumption = baseLoad + morningPeak + eveningPeak + noise;
    
    // Solar: peaks at noon, zero at night
    const solarFactor = hour >= 6 && hour <= 18 
      ? Math.sin(((hour - 6) / 12) * Math.PI) 
      : 0;
    const solar = solarFactor * 8 + (Math.random() - 0.5) * 2;

    const ts = new Date(now);
    ts.setHours(now.getHours() - hours + i);

    return {
      consumptionKwh: Math.max(5, Math.round(consumption * 10) / 10),
      solarProdKwh: Math.max(0, Math.round(solar * 10) / 10),
      timestamp: ts.toISOString()
    };
  });
};
