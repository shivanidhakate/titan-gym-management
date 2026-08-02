const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { mockDb, helpers } = require('../utils/mockDb');

const getFormattedTime = () => {
  const date = new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMinutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + strMinutes + ' ' + ampm;
};

// @desc    QR Check-in (simulated scanner scan)
// @route   POST /api/attendance/checkin-qr
// @access  Private (Member)
const qrCheckIn = async (req, res) => {
  try {
    const memberId = req.user.id;
    const todayStr = new Date().toDateString();
    const startOfToday = new Date(todayStr);

    if (!global.dbConnected) {
      const user = helpers.findUserById(memberId);
      if (!user || user.activeMembership.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You do not have an active membership plan.'
        });
      }

      // Check if already checked in
      const todayLogs = mockDb.attendance.filter(a => 
        a.memberId === memberId && 
        new Date(a.date).toDateString() === todayStr
      );

      if (todayLogs.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Already checked-in today at ${todayLogs[0].checkInTime}`
        });
      }

      const checkInTime = getFormattedTime();
      const attendance = {
        _id: `att_${Math.random().toString(36).substr(2, 9)}`,
        memberId,
        date: new Date(),
        status: 'present',
        checkInTime,
        qrCodeData: `token_${memberId}_${Date.now()}`
      };

      mockDb.attendance.push(attendance);

      // Create Notification
      mockDb.notifications.push({
        _id: `notif_${Math.random().toString(36).substr(2, 9)}`,
        userId: memberId,
        title: 'Check-in Confirmed! ✅',
        message: `Checked into Titan Gym at ${checkInTime}. Enjoy your workout!`,
        type: 'general',
        isRead: false,
        createdAt: new Date()
      });

      return res.status(201).json({
        success: true,
        message: `Check-in successful at ${checkInTime}`,
        data: attendance
      });
    }

    // MongoDB Flow
    const user = await User.findById(memberId);
    if (!user || user.activeMembership.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Access Denied: You do not have an active membership plan.' });
    }

    const endOfToday = new Date(todayStr);
    endOfToday.setHours(23,59,59,999);

    const existingRecord = await Attendance.findOne({
      memberId,
      date: { $gte: startOfToday, $lte: endOfToday }
    });

    if (existingRecord) {
      return res.status(400).json({ success: false, message: `Already checked-in today at ${existingRecord.checkInTime}` });
    }

    const checkInTime = getFormattedTime();
    const qrCodeData = `token_${memberId}_${Date.now()}`;
    
    const attendance = await Attendance.create({
      memberId,
      date: new Date(),
      status: 'present',
      checkInTime,
      qrCodeData
    });

    await Notification.create({
      userId: memberId,
      title: 'Check-in Confirmed! ✅',
      message: `Checked into Titan Gym at ${checkInTime}. Enjoy your workout!`,
      type: 'general'
    });

    res.status(201).json({ success: true, message: `Check-in successful at ${checkInTime}`, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manual check-in (Admin override)
// @route   POST /api/attendance/checkin-manual
// @access  Private (Admin)
const manualCheckIn = async (req, res) => {
  const { memberId } = req.body;

  if (!memberId) {
    return res.status(400).json({ success: false, message: 'Please provide memberId' });
  }

  try {
    const todayStr = new Date().toDateString();

    if (!global.dbConnected) {
      const user = helpers.findUserById(memberId);
      if (!user || user.role !== 'member') {
        return res.status(404).json({ success: false, message: 'Member profile not found' });
      }

      const existing = mockDb.attendance.find(a => 
        a.memberId === memberId && 
        new Date(a.date).toDateString() === todayStr
      );

      if (existing) {
        return res.status(400).json({ success: false, message: `Member is already checked in for today` });
      }

      const checkInTime = getFormattedTime();
      const attendance = {
        _id: `att_${Math.random().toString(36).substr(2, 9)}`,
        memberId,
        date: new Date(),
        status: 'present',
        checkInTime,
        qrCodeData: 'manual_override'
      };

      mockDb.attendance.push(attendance);

      mockDb.notifications.push({
        _id: `notif_${Math.random().toString(36).substr(2, 9)}`,
        userId: memberId,
        title: 'Manual Check-in logged',
        message: `Your attendance has been updated manually by admin at ${checkInTime}.`,
        type: 'general',
        isRead: false,
        createdAt: new Date()
      });

      return res.status(201).json({ success: true, message: 'Attendance logged successfully', data: attendance });
    }

    // MongoDB Flow
    const user = await User.findById(memberId);
    if (!user || user.role !== 'member') {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    const startOfToday = new Date(todayStr);
    const endOfToday = new Date(todayStr);
    endOfToday.setHours(23,59,59,999);

    const existing = await Attendance.findOne({
      memberId,
      date: { $gte: startOfToday, $lte: endOfToday }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: `Member is already checked in for today` });
    }

    const checkInTime = getFormattedTime();
    const attendance = await Attendance.create({
      memberId,
      date: new Date(),
      status: 'present',
      checkInTime,
      qrCodeData: 'manual_override'
    });

    await Notification.create({
      userId: memberId,
      title: 'Manual Check-in logged',
      message: `Your attendance has been updated manually by admin at ${checkInTime}.`,
      type: 'general'
    });

    res.status(201).json({ success: true, message: 'Attendance logged successfully', data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get daily attendance logs (Admin summary)
// @route   GET /api/attendance/daily
// @access  Private (Admin/Trainer)
const getDailyAttendance = async (req, res) => {
  try {
    const todayStr = new Date().toDateString();

    if (!global.dbConnected) {
      const logs = mockDb.attendance.filter(a => 
        new Date(a.date).toDateString() === todayStr
      ).map(a => {
        const member = helpers.findUserById(a.memberId);
        return {
          ...a,
          memberId: member ? { name: member.name, email: member.email, profilePicture: member.profilePicture } : null
        };
      });
      return res.json({ success: true, data: logs });
    }

    // MongoDB Flow
    const startOfToday = new Date(todayStr);
    const endOfToday = new Date(todayStr);
    endOfToday.setHours(23,59,59,999);

    const logs = await Attendance.find({
      date: { $gte: startOfToday, $lte: endOfToday }
    }).populate('memberId', 'name email profilePicture');

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  qrCheckIn,
  manualCheckIn,
  getDailyAttendance
};
