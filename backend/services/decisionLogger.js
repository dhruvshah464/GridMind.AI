/**
 * GridMind.AI — Decision Logger with Learning Loop
 * 
 * Persists all AI decisions to PostgreSQL for:
 * 1. Audit trail
 * 2. Learning loop (compare prediction vs actual)
 * 3. ML retraining data
 */

const prisma = require('../models');

// In-memory buffer for high-frequency logging (flush to DB periodically)
const decisionBuffer = [];
const MAX_BUFFER = 50;

exports.logDecision = async (decision, userId = null) => {
  const entry = {
    userId: userId || undefined,
    prediction: decision.prediction || 'Unknown',
    action: decision.action || 'None',
    impact: decision.impact || 'Unknown',
    confidence: decision.confidence || 0,
    costBenefit: decision.actions ? JSON.stringify(decision.actions.slice(0, 3)) : null,
    riskScore: decision.riskAssessment?.score || null,
    reasoningTrace: decision.context ? JSON.stringify(decision.context) : null,
    wasAccepted: decision.autoMode || false,
    createdAt: new Date()
  };

  // Buffer in memory
  decisionBuffer.push(entry);

  // Flush to DB when buffer is full
  if (decisionBuffer.length >= MAX_BUFFER) {
    exports.flushDecisions();
  }

  console.log(`[DECISION] ${entry.action} | Confidence: ${(entry.confidence).toFixed(2)} | Risk: ${decision.riskAssessment?.level || 'N/A'}`);
};

exports.flushDecisions = async () => {
  if (decisionBuffer.length === 0) return;

  const toFlush = decisionBuffer.splice(0, decisionBuffer.length);

  try {
    await prisma.decision.createMany({
      data: toFlush.map(d => ({
        userId: d.userId,
        prediction: d.prediction,
        action: d.action,
        impact: d.impact,
        confidence: d.confidence,
        costBenefit: d.costBenefit ? JSON.parse(d.costBenefit) : undefined,
        riskScore: d.riskScore,
        reasoningTrace: d.reasoningTrace ? JSON.parse(d.reasoningTrace) : undefined,
        wasAccepted: d.wasAccepted,
        createdAt: d.createdAt
      })),
      skipDuplicates: true
    });
    console.log(`[DECISION_LOGGER] Flushed ${toFlush.length} decisions to database`);
  } catch (err) {
    console.error('[DECISION_LOGGER] DB flush failed:', err.message);
    // Re-add failed entries back to buffer (up to MAX_BUFFER)
    decisionBuffer.unshift(...toFlush.slice(0, MAX_BUFFER - decisionBuffer.length));
  }
};

exports.getRecentDecisions = async (userId, limit = 20) => {
  try {
    return await prisma.decision.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        prediction: true,
        action: true,
        impact: true,
        confidence: true,
        riskScore: true,
        wasAccepted: true,
        createdAt: true
      }
    });
  } catch {
    return decisionBuffer.slice(-limit).reverse();
  }
};

exports.logTrainingData = async (data) => {
  const now = new Date();

  try {
    await prisma.trainingRecord.create({
      data: {
        timestamp: now,
        consumption: data.actual || data.usage || 0,
        solar: data.solar || 0,
        temperature: data.temperature || 30,
        hour: now.getHours(),
        dayOfWeek: now.getDay(),
        rollingMean: data.rollingMean || 0
      }
    });
  } catch (err) {
    console.error('[TRAINING_DATA] Save failed:', err.message);
  }
};

// Flush remaining decisions on process shutdown
process.on('beforeExit', () => exports.flushDecisions());
