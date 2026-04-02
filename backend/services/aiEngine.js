/**
 * GridMind.AI — Multi-Layer Decision Intelligence Engine
 * 
 * Architecture:
 *   1. Prediction Layer  → ML bridge + heuristic forecasting
 *   2. Reasoning Layer   → Multi-variable optimization (tariff × weather × behavior × solar)
 *   3. Decision Engine   → Action prioritization + cost-benefit scoring + confidence
 *   4. Learning Loop     → Compare predictions vs actuals, feed back to ML
 */

const axios = require('axios');
const prisma = require('../models');
const BehaviorEngine = require('./behaviorEngine');
const WeatherService = require('./weatherService');

// ─── ML Bridge ──────────────────────────────────────────────

async function getMLPrediction(input) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'https://gridmind-ai-service.onrender.com';
    const res = await axios.post(`${aiServiceUrl}/predict`, input, { timeout: 5000 });
    return res.data;
  } catch {
    return null; // ML service is optional enhancement
  }
}

// ─── Tariff Engine ──────────────────────────────────────────

const TARIFF_RATES = {
  'California':  { peak: 0.42, midPeak: 0.28, offPeak: 0.14, peakHours: [16, 21], currency: 'USD' },
  'Texas':       { peak: 0.18, midPeak: 0.12, offPeak: 0.08, peakHours: [14, 20], currency: 'USD' },
  'New York':    { peak: 0.35, midPeak: 0.22, offPeak: 0.12, peakHours: [14, 22], currency: 'USD' },
  'Florida':     { peak: 0.16, midPeak: 0.11, offPeak: 0.09, peakHours: [12, 21], currency: 'USD' },
  'Mumbai':      { peak: 12.0, midPeak: 8.5,  offPeak: 5.0,  peakHours: [18, 23], currency: 'INR' },
  'Delhi':       { peak: 10.0, midPeak: 7.0,  offPeak: 4.5,  peakHours: [18, 22], currency: 'INR' },
  'Bangalore':   { peak: 9.5,  midPeak: 7.0,  offPeak: 4.8,  peakHours: [18, 22], currency: 'INR' },
};

function getTariffContext(region, hour) {
  const tariff = TARIFF_RATES[region] || TARIFF_RATES['California'];
  const [peakStart, peakEnd] = tariff.peakHours;
  
  let period = 'offPeak';
  let rate = tariff.offPeak;
  
  if (hour >= peakStart && hour < peakEnd) {
    period = 'peak';
    rate = tariff.peak;
  } else if (hour >= peakStart - 2 || hour >= peakEnd) {
    period = 'midPeak';
    rate = tariff.midPeak;
  }
  
  return { period, rate, tariff, savings: tariff.peak - tariff.offPeak };
}

// ─── Confidence Calculator ──────────────────────────────────

function calculateConfidence(usage, mlConfidence) {
  if (mlConfidence) return mlConfidence;
  if (!usage || usage.length === 0) return 0.6;
  
  const mean = usage.reduce((a, b) => a + b, 0) / usage.length;
  const variance = usage.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / usage.length;
  const cv = Math.sqrt(variance) / (mean + 1e-5); // Coefficient of variation
  
  return Math.max(0.55, Math.min(0.95, 1 - cv));
}

// ─── Risk Scoring ───────────────────────────────────────────

function calculateRiskScore(context) {
  let risk = 0;
  const factors = [];

  // Usage spike risk
  if (context.peakUsage > context.avgUsage * 2) {
    risk += 30;
    factors.push({ factor: 'Usage Spike', severity: 'high', detail: 'Peak usage is 2x+ above average' });
  }

  // Tariff risk
  if (context.tariff.period === 'peak') {
    risk += 25;
    factors.push({ factor: 'Peak Tariff', severity: 'high', detail: `Currently in peak pricing at ${context.tariff.rate}/kWh` });
  }

  // Weather risk
  if (context.weather.temperature > 35) {
    risk += 20;
    factors.push({ factor: 'Heat Wave', severity: 'medium', detail: `${context.weather.temperature}°C — expect HVAC surge` });
  }

  // Low solar
  if (context.weather.solarRadiation < 200 && new Date().getHours() >= 8 && new Date().getHours() <= 16) {
    risk += 15;
    factors.push({ factor: 'Low Solar', severity: 'medium', detail: 'Cloud cover reducing solar generation' });
  }

  // Anomaly
  if (context.anomalyDetected) {
    risk += 35;
    factors.push({ factor: 'Anomaly Detected', severity: 'critical', detail: 'ML model flagged unusual consumption pattern' });
  }

  return {
    score: Math.min(100, risk),
    level: risk >= 60 ? 'critical' : risk >= 35 ? 'elevated' : 'normal',
    factors
  };
}

// ─── Cost-Benefit Analysis ──────────────────────────────────

function calculateCostBenefit(actions, tariffContext, monthlyUsage) {
  return actions.map(action => {
    const dailySavings = action.savingsPercent * (monthlyUsage / 30) * tariffContext.savings;
    const monthlySavings = dailySavings * 30;
    const annualSavings = monthlySavings * 12;
    
    return {
      ...action,
      dailySavingsUsd: Math.round(dailySavings * 100) / 100,
      monthlySavingsUsd: Math.round(monthlySavings * 100) / 100,
      annualSavingsUsd: Math.round(annualSavings * 100) / 100,
      currency: tariffContext.tariff.currency
    };
  });
}

// ─── Bill Projection ────────────────────────────────────────

function projectBill(usage, region, daysInMonth = 30) {
  const tariff = TARIFF_RATES[region] || TARIFF_RATES['California'];
  const dailyUsage = Array.isArray(usage) && usage.length > 0
    ? usage.reduce((a, b) => a + b, 0)
    : 35; // kWh per day estimate
  
  // Weighted average rate (assume 30% peak, 30% mid, 40% off-peak)
  const weightedRate = tariff.peak * 0.3 + tariff.midPeak * 0.3 + tariff.offPeak * 0.4;
  const baselineCost = dailyUsage * daysInMonth * weightedRate;
  
  // Optimized cost (shift 60% of peak to off-peak)
  const optimizedRate = tariff.peak * 0.12 + tariff.midPeak * 0.28 + tariff.offPeak * 0.6;
  const optimizedCost = dailyUsage * daysInMonth * optimizedRate;
  
  return {
    baselineCost: Math.round(baselineCost * 100) / 100,
    optimizedCost: Math.round(optimizedCost * 100) / 100,
    projectedSavings: Math.round((baselineCost - optimizedCost) * 100) / 100,
    savingsPercent: Math.round(((baselineCost - optimizedCost) / baselineCost) * 100),
    currency: tariff.currency,
    dailyUsageKwh: Math.round(dailyUsage * 10) / 10,
    weightedRate: Math.round(weightedRate * 100) / 100
  };
}

// ─── Main Decision Engine ───────────────────────────────────

exports.runAIEngine = async (data, userProfile = {}, options = {}) => {
  const { usage = [], solar = [] } = data;
  const { autoMode = false, userId = null, region = 'California', monthlyUsageKwh = 800 } = options;
  
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();

  // ─── 1. Prediction Layer ─────────────────────────────────
  let peak = 0;
  let peakIndex = -1;

  if (usage.length > 0) {
    peak = Math.max(...usage);
    peakIndex = usage.indexOf(peak);
  } else {
    peak = 45;
    peakIndex = currentHour;
  }

  const mlPrediction = await getMLPrediction({
    hour: currentHour,
    day: currentDay,
    temperature: 30.0,
    solar_radiation: solar.length > 0 ? solar[solar.length - 1] : 0.0,
    pastUsage: usage.length > 0 ? usage.slice(-4) : [20, 25, 30, 28]
  });

  // ─── 2. Context Gathering ────────────────────────────────
  const weather = await WeatherService.getCurrentWeather(region);
  const tariffContext = getTariffContext(region, currentHour);
  
  let behaviorProfile = userProfile;
  if (userId) {
    try {
      behaviorProfile = await BehaviorEngine.analyzeUserBehavior(userId);
    } catch { /* Use defaults */ }
  }

  // ─── 3. Reasoning Layer ──────────────────────────────────
  const avgUsage = usage.length > 0 ? usage.reduce((a, b) => a + b, 0) / usage.length : 30;
  
  const context = {
    peakUsage: peak,
    avgUsage,
    tariff: tariffContext,
    weather,
    anomalyDetected: mlPrediction?.anomaly?.status || false,
    behaviorProfile
  };

  // Build prioritized actions
  const rawActions = [];

  // Tariff-based actions
  if (tariffContext.period === 'peak') {
    rawActions.push({
      action: 'Defer non-essential loads to off-peak window',
      priority: 'critical',
      savingsPercent: 0.15,
      reason: `Peak tariff active (${tariffContext.rate}/kWh). Off-peak rate is ${tariffContext.tariff.offPeak}/kWh.`
    });
  }

  // Weather-based actions
  if (weather.temperature > 32) {
    rawActions.push({
      action: 'Pre-cool building before afternoon peak',
      priority: 'high',
      savingsPercent: 0.08,
      reason: `High temperature (${weather.temperature}°C) will drive HVAC demand surge.`
    });
  }

  if (weather.solarRadiation > 600) {
    rawActions.push({
      action: 'Maximize battery charging from solar surplus',
      priority: 'medium',
      savingsPercent: 0.12,
      reason: `Strong solar radiation (${weather.solarRadiation} W/m²). Excess can be stored.`
    });
  }

  // Behavior-based actions
  if (behaviorProfile.usageStyle === 'peaky') {
    rawActions.push({
      action: 'Flatten load curve by distributing heavy consumption',
      priority: 'high',
      savingsPercent: 0.10,
      reason: 'Usage pattern shows extreme peaks. Flattening reduces demand charges.'
    });
  }

  // Anomaly actions
  if (mlPrediction?.anomaly?.status) {
    rawActions.push({
      action: 'Immediate load audit — anomaly detected in consumption pattern',
      priority: 'critical',
      savingsPercent: 0.05,
      reason: 'ML model detected deviation from expected pattern. Possible equipment malfunction.'
    });
  }

  // Default action if none triggered
  if (rawActions.length === 0) {
    rawActions.push({
      action: 'System optimized — maintain current schedule',
      priority: 'low',
      savingsPercent: 0.03,
      reason: 'All variables within optimal range. No intervention needed.'
    });
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  rawActions.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));

  // ─── 4. Decision Engine Output ───────────────────────────
  const costedActions = calculateCostBenefit(rawActions, tariffContext, monthlyUsageKwh);
  const confidence = calculateConfidence(usage, mlPrediction?.confidence);
  const riskAssessment = calculateRiskScore(context);
  const billProjection = projectBill(usage, region);

  const primaryAction = costedActions[0];
  const totalDailySavings = costedActions.reduce((sum, a) => sum + a.dailySavingsUsd, 0);

  // Autonomous schedule (only if auto mode)
  const schedule = autoMode ? [
    { device: 'EV Charger', time: '02:00 AM', action: 'Start charging' },
    { device: 'HVAC', mode: 'eco', time: '06:00 PM', action: 'Switch to eco mode' },
    { device: 'Water Heater', time: '04:00 AM', action: 'Pre-heat cycle' }
  ] : [];

  // Prediction array for chart visualization
  const predictionArray = [];
  for (let i = 1; i <= 6; i++) {
    const futureHour = (currentHour + i) % 24;
    const futureTariff = getTariffContext(region, futureHour);
    const basePrediction = mlPrediction ? mlPrediction.predictedUsage : peak;
    const hourFactor = 0.7 + Math.sin(futureHour / 4) * 0.3;
    predictionArray.push(Math.round(basePrediction * hourFactor * 100) / 100);
  }

  const decision = {
    // Core prediction
    prediction: mlPrediction
      ? `Peak at ${mlPrediction.peakHour} — ${mlPrediction.predictedUsage} kWh projected`
      : `Peak usage detected at interval ${peakIndex} — ${peak.toFixed(1)} kWh`,
    predictionArray,
    
    // Primary recommendation
    action: primaryAction.action,
    actionReason: primaryAction.reason,
    impact: `$${totalDailySavings.toFixed(2)}/day savings potential`,
    
    // Intelligence layers
    confidence: Math.round(confidence * 100) / 100,
    riskAssessment,
    billProjection,
    
    // All prioritized actions with cost-benefit
    actions: costedActions,
    
    // Autonomous mode
    schedule,
    autoMode,
    
    // ML enrichment
    mlPrediction: mlPrediction ? {
      predictedUsage: mlPrediction.predictedUsage,
      peakHour: mlPrediction.peakHour,
      confidence: mlPrediction.confidence
    } : null,
    anomaly: mlPrediction?.anomaly || { status: false, severity: 'none' },
    
    // Context used
    context: {
      weather: {
        temperature: weather.temperature,
        cloudCover: weather.cloudCover,
        solarRadiation: weather.solarRadiation
      },
      tariff: {
        period: tariffContext.period,
        currentRate: tariffContext.rate,
        currency: tariffContext.tariff.currency
      },
      behaviorStyle: behaviorProfile.usageStyle || 'unknown'
    }
  };

  return decision;
};

// ─── What-If Simulation ─────────────────────────────────────

exports.runWhatIfSimulation = async (scenario) => {
  const { 
    systemSizeKw = 10, 
    region = 'California', 
    monthlyUsageKwh = 800,
    addSolar = false,
    addBattery = false,
    shiftSchedule = false 
  } = scenario;

  const tariff = TARIFF_RATES[region] || TARIFF_RATES['California'];
  const weather = await WeatherService.getCurrentWeather(region);

  // Baseline: current cost
  const baseline = projectBill([], region);

  // Solar impact
  let solarSavings = 0;
  if (addSolar) {
    const dailySolarKwh = systemSizeKw * 4.5 * (weather.solarRadiation / 1000);
    solarSavings = dailySolarKwh * tariff.midPeak * 30;
  }

  // Battery impact (store solar, discharge at peak)
  let batterySavings = 0;
  if (addBattery) {
    const batteryCapacity = systemSizeKw * 0.5; // kWh
    batterySavings = batteryCapacity * (tariff.peak - tariff.offPeak) * 30;
  }

  // Schedule shift impact
  let scheduleSavings = 0;
  if (shiftSchedule) {
    scheduleSavings = monthlyUsageKwh * 0.3 * (tariff.peak - tariff.offPeak);
  }

  const totalSavingsMonthly = solarSavings + batterySavings + scheduleSavings;
  const optimizedCost = baseline.baselineCost - totalSavingsMonthly;

  return {
    baseline: baseline.baselineCost,
    optimizedCost: Math.max(0, Math.round(optimizedCost * 100) / 100),
    totalSavingsMonthly: Math.round(totalSavingsMonthly * 100) / 100,
    breakdown: {
      solar: Math.round(solarSavings * 100) / 100,
      battery: Math.round(batterySavings * 100) / 100,
      scheduling: Math.round(scheduleSavings * 100) / 100
    },
    roi: {
      solarPayback: addSolar ? Math.round((systemSizeKw * 2500) / (solarSavings * 12) * 10) / 10 : null,
      batteryPayback: addBattery ? Math.round((systemSizeKw * 800) / (batterySavings * 12) * 10) / 10 : null
    },
    currency: tariff.currency,
    weatherContext: {
      temperature: weather.temperature,
      solarRadiation: weather.solarRadiation
    }
  };
};

// ─── Bill Forecast Export ───────────────────────────────────

exports.getBillForecast = (usage, region) => projectBill(usage, region);
