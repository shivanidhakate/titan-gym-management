const express = require('express');
const router = express.Router();
const {
  getTrainerDashboard,
  getAssignedMembers,
  getMemberWorkoutPlanByTrainer,
  createOrUpdateWorkoutPlan,
  recordMemberProgress,
  getTrainerBookings,
  updateBookingStatus,
  getMemberProgressHistory
} = require('../controllers/trainerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('trainer'));

router.get('/dashboard', getTrainerDashboard);
router.get('/members', getAssignedMembers);
router.get('/workout/:memberId', getMemberWorkoutPlanByTrainer);
router.post('/workout', createOrUpdateWorkoutPlan);
router.post('/progress', recordMemberProgress);
router.get('/bookings', getTrainerBookings);
router.put('/bookings/:id', updateBookingStatus);
router.get('/members/:memberId/progress', getMemberProgressHistory);

module.exports = router;
