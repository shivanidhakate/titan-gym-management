const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: '12' },
  weight: { type: String, default: 'Bodyweight' },
  notes: { type: String, default: '' }
});

const DayPlanSchema = new mongoose.Schema({
  day: { type: String, required: true }, // e.g. "Monday", "Tuesday"
  exercises: [ExerciseSchema]
});

const WorkoutPlanSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, default: 'Custom Fitness Plan' },
  startDate: { type: Date },
  endDate: { type: Date },
  days: [DayPlanSchema]
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);
