const express = require('express');
const router = express.Router();
const {
  getMemberDashboard,
  updateMemberProfile,
  logBMIRecord,
  getBMIHistory,
  getTrainers,
  bookTrainerSession,
  cancelBooking,
  getMemberBookings,
  getMemberWorkoutPlan,
  getMemberAttendance
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply protection & member role lock to all routes in this router
router.use(protect);
router.use(authorize('member'));

router.get('/dashboard', getMemberDashboard);
router.put('/profile', upload.single('profilePicture'), updateMemberProfile);
router.route('/bmi')
  .post(logBMIRecord)
  .get(getBMIHistory);
router.get('/trainers', getTrainers);
router.route('/bookings')
  .post(bookTrainerSession)
  .get(getMemberBookings);
router.put('/bookings/:id/cancel', cancelBooking);
router.get('/workout', getMemberWorkoutPlan);
router.get('/attendance', getMemberAttendance);

module.exports = router;
