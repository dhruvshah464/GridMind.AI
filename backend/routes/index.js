const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const energyRoutes = require('./energy');
const aiRoutes = require('./ai');

router.use('/auth', authRoutes);
router.use('/energy', energyRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
