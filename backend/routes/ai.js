const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth');

// Public (demo-accessible)
router.get('/decision', aiController.getAIDecision);
router.get('/forecast', aiController.getBillForecastEndpoint);
router.get('/risk', aiController.getRiskScore);

// Requires auth for mutation
router.post('/optimize', aiController.getOptimizationInsights);
router.post('/simulate', aiController.runSimulation);
router.post('/chat', aiController.streamChat);
router.post('/whatif', aiController.runWhatIf);

// Decision history (auth required)
router.get('/decisions', authMiddleware, aiController.getDecisionHistory);

module.exports = router;
