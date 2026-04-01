/**
 * GridMind.AI — AI Controller
 * Unified entry point for all AI decision endpoints
 */

const { runAIEngine, runWhatIfSimulation, getBillForecast } = require('../services/aiEngine');
const { normalizeEnergyData, generateMockTimeseries } = require('../services/dataAdapter');
const { logDecision, logTrainingData, getRecentDecisions, flushDecisions } = require('../services/decisionLogger');
const LLMService = require('../services/llmService');
const prisma = require('../models');

// ─── GET /ai/decision ───────────────────────────────────────

exports.getAIDecision = async (req, res) => {
  try {
    const userId = req.user?.id;
    let rawTimeseries = [];
    let region = 'California';
    let monthlyUsageKwh = 800;

    // Try to get real profile data
    try {
      if (userId && userId !== '9999') {
        const profile = await prisma.energyProfile.findFirst({
          where: { userId },
          include: { historicalUsages: { orderBy: { timestamp: 'desc' }, take: 24 } }
        });
        if (profile?.historicalUsages?.length > 0) {
          rawTimeseries = profile.historicalUsages;
          region = profile.locationRegion || region;
          monthlyUsageKwh = profile.monthlyUsageKwh || monthlyUsageKwh;
        }
      }
    } catch (dbErr) {
      console.warn('[AI] DB bypassed:', dbErr.message);
    }

    // Fallback to realistic mock data
    if (rawTimeseries.length === 0) {
      rawTimeseries = generateMockTimeseries(24);
    }

    const normalizedData = normalizeEnergyData({ timeseries: rawTimeseries });
    const decision = await runAIEngine(normalizedData, {}, {
      autoMode: false,
      userId,
      region,
      monthlyUsageKwh
    });

    // Async logging (don't block response)
    logDecision(decision, userId).catch(() => {});
    logTrainingData({
      actual: normalizedData.usage.length > 0 ? Math.max(...normalizedData.usage) : 35,
      solar: normalizedData.solar.length > 0 ? normalizedData.solar[normalizedData.solar.length - 1] : 0
    }).catch(() => {});

    res.json({ success: true, data: decision });
  } catch (err) {
    console.error('[AI] Decision error:', err);
    res.status(500).json({ success: false, msg: 'Failed to generate AI decision' });
  }
};

// ─── POST /ai/optimize ──────────────────────────────────────

exports.getOptimizationInsights = async (req, res) => {
  try {
    const userId = req.user?.id;
    const autoMode = req.body?.autoMode === true;

    const rawTimeseries = generateMockTimeseries(24);
    const normalizedData = normalizeEnergyData({ timeseries: rawTimeseries });

    const decision = await runAIEngine(normalizedData, {}, {
      autoMode,
      userId,
      region: 'California'
    });

    // Enhance with LLM
    let enhancedInsight = null;
    try {
      enhancedInsight = await LLMService.enhanceInsight(decision, {
        systemSizeKw: 10,
        region: 'California',
        monthlyUsageKwh: 800
      });
    } catch { /* LLM optional */ }

    logDecision(decision, userId).catch(() => {});

    res.json({
      success: true,
      data: decision,
      enhancedInsight,
      autoMode
    });
  } catch (err) {
    console.error('[AI] Optimization error:', err);
    res.status(500).json({ success: false, msg: 'Failed to generate optimization insights' });
  }
};

// ─── POST /ai/simulate ─────────────────────────────────────

exports.runSimulation = async (req, res) => {
  try {
    const { systemSize, region, monthlyUsage } = req.body;

    if (!systemSize || !region || !monthlyUsage) {
      return res.status(400).json({ success: false, msg: 'Missing simulation inputs (systemSize, region, monthlyUsage)' });
    }

    // AI Engine simulation
    const simulatedUsageHourly = monthlyUsage / 30 / 24;
    const rawTimeseries = Array.from({ length: 24 }).map((_, i) => ({
      consumptionKwh: simulatedUsageHourly * (1 + Math.sin(i / 3) * 0.5),
      solarProdKwh: systemSize * Math.max(0, Math.sin((i - 6) / 4)) * 0.8,
      timestamp: new Date().toISOString()
    }));

    const normalizedData = normalizeEnergyData({ timeseries: rawTimeseries });
    const decision = await runAIEngine(normalizedData, {}, {
      region,
      monthlyUsageKwh: parseFloat(monthlyUsage)
    });

    // Cost calculations
    const modifier = { 'California': 0.30, 'Texas': 0.15, 'New York': 0.22, 'Florida': 0.14 }[region] || 0.20;
    const monthlySavings = (monthlyUsage * 0.4) * modifier;
    const estimatedCost = parseFloat(systemSize) * 3000;
    const paybackPeriod = estimatedCost / (monthlySavings * 12 || 1);

    // LLM explanation
    let explanation = `Optimizing peak usage (6-9 PM) reduces ROI from ${(paybackPeriod * 1.3).toFixed(1)} → ${paybackPeriod.toFixed(1)} years.`;
    try {
      const llmExplanation = await LLMService.enhanceInsight(decision, {
        systemSizeKw: systemSize,
        region,
        monthlyUsageKwh: monthlyUsage
      });
      if (llmExplanation) explanation = llmExplanation;
    } catch { /* LLM optional */ }

    res.json({
      success: true,
      data: {
        roiYears: parseFloat(paybackPeriod.toFixed(1)),
        savingsMonthly: parseFloat(monthlySavings.toFixed(2)),
        paybackPeriod: parseFloat(paybackPeriod.toFixed(1)),
        explanation,
        decision,
        billProjection: decision.billProjection
      }
    });
  } catch (err) {
    console.error('[AI] Simulation error:', err);
    res.status(500).json({ success: false, msg: 'AI Simulation failed' });
  }
};

// ─── POST /ai/chat ──────────────────────────────────────────

exports.streamChat = async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const result = await LLMService.chat(messages);

    // Streaming response (OpenAI)
    if (result && typeof result[Symbol.asyncIterator] === 'function') {
      for await (const chunk of result) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    }
    // Non-streaming fallback (Gemini / rule-based)
    else if (result?.fallbackText) {
      // Simulate streaming for consistent UX
      const words = result.fallbackText.split(' ');
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + ' ';
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.write(`data: ${JSON.stringify({ content: 'GridMind AI is processing your request. Please try again shortly.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
};

// ─── POST /ai/whatif ────────────────────────────────────────

exports.runWhatIf = async (req, res) => {
  try {
    const scenario = req.body;
    const result = await runWhatIfSimulation(scenario);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[AI] What-if error:', err);
    res.status(500).json({ success: false, msg: 'What-if simulation failed' });
  }
};

// ─── GET /ai/forecast ───────────────────────────────────────

exports.getBillForecastEndpoint = async (req, res) => {
  try {
    const region = req.query.region || 'California';
    const forecast = getBillForecast([], region);
    
    let explanation = null;
    try {
      explanation = await LLMService.explainBillForecast(forecast);
    } catch { /* LLM optional */ }

    res.json({ success: true, data: { ...forecast, explanation } });
  } catch (err) {
    console.error('[AI] Forecast error:', err);
    res.status(500).json({ success: false, msg: 'Bill forecast failed' });
  }
};

// ─── GET /ai/decisions ──────────────────────────────────────

exports.getDecisionHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit) || 20;
    const decisions = await getRecentDecisions(userId, limit);
    res.json({ success: true, data: decisions });
  } catch (err) {
    console.error('[AI] Decision history error:', err);
    res.status(500).json({ success: false, msg: 'Failed to fetch decision history' });
  }
};

// ─── GET /ai/risk ───────────────────────────────────────────

exports.getRiskScore = async (req, res) => {
  try {
    const rawTimeseries = generateMockTimeseries(24);
    const normalizedData = normalizeEnergyData({ timeseries: rawTimeseries });
    const decision = await runAIEngine(normalizedData, {}, {
      region: req.query.region || 'California'
    });
    
    res.json({
      success: true,
      data: {
        riskAssessment: decision.riskAssessment,
        confidence: decision.confidence,
        context: decision.context
      }
    });
  } catch (err) {
    console.error('[AI] Risk score error:', err);
    res.status(500).json({ success: false, msg: 'Risk assessment failed' });
  }
};
