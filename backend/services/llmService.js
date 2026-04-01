/**
 * GridMind.AI — Dual LLM Service (OpenAI + Gemini with fallback chain)
 * 
 * Priority: OpenAI GPT-4o-mini → Gemini 1.5 Flash → Rule-based fallback
 */

let openai = null;
let genAI = null;
let geminiModel = null;

// Lazy-init OpenAI
function getOpenAI() {
  if (!openai) {
    try {
      const { OpenAI } = require('openai');
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey && apiKey !== '' && !apiKey.startsWith('YOUR_')) {
        openai = new OpenAI({ apiKey });
      }
    } catch { /* OpenAI not available */ }
  }
  return openai;
}

// Lazy-init Gemini
function getGemini() {
  if (!geminiModel) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== '' && !apiKey.startsWith('YOUR_')) {
        genAI = new GoogleGenerativeAI(apiKey);
        geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      }
    } catch { /* Gemini not available */ }
  }
  return geminiModel;
}

// ─── Core LLM Call with Fallback Chain ──────────────────────

async function callLLM(systemPrompt, userPrompt, options = {}) {
  const { temperature = 0.3, maxTokens = 300, jsonMode = false } = options;

  // Attempt 1: OpenAI
  const oai = getOpenAI();
  if (oai) {
    try {
      const params = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
      };
      if (jsonMode) params.response_format = { type: 'json_object' };
      
      const completion = await oai.chat.completions.create(params);
      const content = completion.choices[0].message.content.trim();
      return { content, provider: 'openai' };
    } catch (err) {
      console.warn('[LLM] OpenAI failed:', err.message);
    }
  }

  // Attempt 2: Gemini
  const gem = getGemini();
  if (gem) {
    try {
      const result = await gem.generateContent(`${systemPrompt}\n\n${userPrompt}`);
      const response = await result.response;
      return { content: response.text().trim(), provider: 'gemini' };
    } catch (err) {
      console.warn('[LLM] Gemini failed:', err.message);
    }
  }

  // Fallback: null
  return null;
}

// ─── Public API ─────────────────────────────────────────────

class LLMService {

  /**
   * Enhance a raw AI engine decision into a professional insight.
   */
  static async enhanceInsight(decision, systemStats = {}) {
    const systemPrompt = `You are GridMind Intelligence, a senior enterprise AI energy analyst.
Convert the raw AI decision data into a concise, professional 2-3 sentence recommendation.
Focus on actionable business/financial metrics. Be specific with numbers.
Do not use markdown formatting. Return plain text only.`;

    const userPrompt = `System: ${systemStats.systemSizeKw || 10}kW in ${systemStats.region || 'California'}
Monthly Usage: ${systemStats.monthlyUsageKwh || 800}kWh
AI Decision: ${JSON.stringify({
  action: decision.action,
  impact: decision.impact,
  confidence: decision.confidence,
  riskLevel: decision.riskAssessment?.level,
  tariffPeriod: decision.context?.tariff?.period,
  temperature: decision.context?.weather?.temperature
})}`;

    const result = await callLLM(systemPrompt, userPrompt, { maxTokens: 150 });
    
    if (result) return result.content;
    
    // Structured fallback
    return `Based on your ${systemStats.monthlyUsageKwh || 800} kWh usage in ${systemStats.region || 'your region'}, ${decision.action.toLowerCase()}. ${decision.impact}.`;
  }

  /**
   * Generate a conversational AI response for the chat console.
   */
  static async chat(messages) {
    const systemPrompt = `You are GridMind AI, an expert energy intelligence assistant.
You help users optimize electricity usage, reduce bills, and improve energy efficiency.
Be concise, data-driven, and actionable. Reference real energy concepts (TOU rates, demand charges, solar optimization, battery arbitrage).
If asked about non-energy topics, briefly redirect to your expertise.
Maximum 200 words per response.`;

    // Try OpenAI streaming first
    const oai = getOpenAI();
    if (oai) {
      try {
        return await oai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          stream: true,
          temperature: 0.4,
          max_tokens: 300,
        });
      } catch (err) {
        console.warn('[LLM] OpenAI stream failed:', err.message);
      }
    }

    // Gemini non-streaming fallback
    const gem = getGemini();
    if (gem) {
      try {
        const lastMessage = messages[messages.length - 1]?.content || '';
        const result = await gem.generateContent(`${systemPrompt}\n\nUser: ${lastMessage}`);
        const text = (await result.response).text();
        return { fallbackText: text, provider: 'gemini' };
      } catch (err) {
        console.warn('[LLM] Gemini fallback failed:', err.message);
      }
    }

    return { fallbackText: 'GridMind AI is currently offline. Your energy data is still being monitored and optimized.', provider: 'fallback' };
  }

  /**
   * Generate bill forecast explanation.
   */
  static async explainBillForecast(forecast) {
    const systemPrompt = `You are GridMind AI. Explain an energy bill forecast in 2-3 clear sentences.
Focus on why costs are projected this way and what the user can do. No markdown.`;

    const userPrompt = `Bill Forecast:
- Baseline: $${forecast.baselineCost}
- Optimized: $${forecast.optimizedCost}
- Savings: $${forecast.projectedSavings} (${forecast.savingsPercent}%)
- Daily Usage: ${forecast.dailyUsageKwh} kWh`;

    const result = await callLLM(systemPrompt, userPrompt, { maxTokens: 120 });
    return result?.content || `Your projected bill is $${forecast.baselineCost}. With GridMind optimization, you could save $${forecast.projectedSavings} (${forecast.savingsPercent}%).`;
  }

  /**
   * Explain why a specific decision was made (AI transparency layer).
   */
  static async explainDecision(decision) {
    const systemPrompt = `You are GridMind AI. Explain WHY a specific energy optimization decision was made.
Be transparent about the factors considered. 3 sentences max. No markdown.`;

    const userPrompt = `Decision: ${decision.action}
Reason: ${decision.actionReason}
Risk Level: ${decision.riskAssessment?.level}
Weather: ${decision.context?.weather?.temperature}°C
Tariff: ${decision.context?.tariff?.period} at ${decision.context?.tariff?.currentRate}/kWh
Confidence: ${(decision.confidence * 100).toFixed(0)}%`;

    const result = await callLLM(systemPrompt, userPrompt, { maxTokens: 120 });
    return result?.content || decision.actionReason;
  }
}

module.exports = LLMService;
