const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['member', 'trainer', 'admin'], default: 'member' },
  profilePicture: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  dob: { type: Date },
  
  // Trainer specific fields
  trainerSpecialties: [{ type: String }],
  trainerStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
  trainerBio: { type: String, default: '' },
  trainerRate: { type: Number, default: 0 },
  
  // Member specific fields
  assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  activeMembership: {
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', default: null },
    status: { type: String, enum: ['active', 'expired', 'none'], default: 'none' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null }
  }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
