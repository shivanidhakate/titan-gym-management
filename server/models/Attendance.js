const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
  checkInTime: { type: String, required: true }, // e.g. "08:30 AM"
  qrCodeData: { type: String, default: '' } // Unique token representing checkin
}, { timestamps: true });

// Index for query efficiency
AttendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
