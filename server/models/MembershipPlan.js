const mongoose = require('mongoose');

const MembershipPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  durationMonths: { type: Number, required: true }, // e.g. 1, 3, 6, 12
  price: { type: Number, required: true },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MembershipPlan', MembershipPlanSchema);
