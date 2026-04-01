const mongoose = require('mongoose');

const energyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appliance: { type: String, required: true },
  powerRatingKw: { type: Number, required: true },
  usageHours: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  cost: { type: Number, required: true },
  optimizedSchedule: { type: String }
});

module.exports = mongoose.model('EnergyLog', energyLogSchema);
