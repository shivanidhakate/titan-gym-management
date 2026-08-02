const mongoose = require('mongoose');

const BMIRecordsSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weight: { type: Number, required: true }, // in kg
  height: { type: Number, required: true }, // in cm
  bmi: { type: Number, required: true },
  bodyFat: { type: Number, default: null }, // optional body fat %
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('BMIRecords', BMIRecordsSchema);
