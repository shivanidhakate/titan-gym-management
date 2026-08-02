const express = require('express');
const router = express.Router();
const { qrCheckIn, manualCheckIn, getDailyAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/checkin-qr', protect, authorize('member'), qrCheckIn);
router.post('/checkin-manual', protect, authorize('admin'), manualCheckIn);
router.get('/daily', protect, authorize('admin', 'trainer'), getDailyAttendance);

module.exports = router;
