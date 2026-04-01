const express = require('express');
const router = express.Router();
const energyController = require('../controllers/energy.controller');
const authMiddleware = require('../middleware/auth');

router.post('/ingest', authMiddleware, energyController.ingestData);
router.get('/dashboard', authMiddleware, energyController.getDashboardMetrics);
router.post('/simulate', authMiddleware, energyController.simulateSystem);

module.exports = router;
