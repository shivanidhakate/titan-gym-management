const User = require('../models/User');
const Booking = require('../models/Booking');
const WorkoutPlan = require('../models/WorkoutPlan');
const BMIRecords = require('../models/BMIRecords');
const Attendance = require('../models/Attendance');
const { mockDb, helpers } = require('../utils/mockDb');

// @desc    Get trainer dashboard summary
// @route   GET /api/trainers/dashboard
// @access  Private (Trainer)
const getTrainerDashboard = async (req, res) => {
  try {
    const trainerId = req.user.id;

    if (!global.dbConnected) {
      const memberCount = mockDb.users.filter(u => u.assignedTrainer === trainerId && u.role === 'member').length;
      
      const startOfToday = new Date().setHours(0,0,0,0);
      const endOfToday = new Date().setHours(23,59,59,999);
      
      const todaysBookingsCount = mockDb.bookings.filter(b => 
        b.trainerId === trainerId &&
        b.status === 'approved' &&
        new Date(b.date) >= startOfToday &&
        new Date(b.date) <= endOfToday
      ).length;

      const upcomingBookings = mockDb.bookings.filter(b =>
        b.trainerId === trainerId &&
        ['pending', 'approved'].includes(b.status) &&
        new Date(b.date) >= startOfToday
      ).map(b => {
        const member = helpers.findUserById(b.memberId);
        return {
          ...b,
          memberId: member ? { _id: member._id, name: member.name, email: member.email, profilePicture: member.profilePicture, phone: member.phone } : null
        };
      });

      return res.json({
        success: true,
        data: {
          memberCount,
          todaysBookingsCount,
          upcomingBookings
        }
      });
    }

    // MongoDB Flow
    const memberCount = await User.countDocuments({ assignedTrainer: trainerId, role: 'member' });
    const startOfToday = new Date().setHours(0,0,0,0);
    const endOfToday = new Date().setHours(23,59,59,999);
    
    const todaysBookingsCount = await Booking.countDocuments({
      trainerId,
      status: 'approved',
      date: { $gte: startOfToday, $lte: endOfToday }
    });

    const upcomingBookings = await Booking.find({
      trainerId,
      status: { $in: ['pending', 'approved'] },
      date: { $gte: startOfToday }
    })
    .sort({ date: 1 })
    .populate('memberId', 'name email profilePicture phone');

    res.json({
      success: true,
      data: {
        memberCount,
        todaysBookingsCount,
        upcomingBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all members assigned to this trainer
// @route   GET /api/trainers/members
// @access  Private (Trainer)
const getAssignedMembers = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const members = mockDb.users.filter(u => u.assignedTrainer === req.user.id && u.role === 'member');
      return res.json({ success: true, data: members });
    }

    const members = await User.find({ assignedTrainer: req.user.id, role: 'member' })
      .select('name email phone profilePicture activeMembership gender dob address');
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get or create member workout plan
// @route   GET /api/trainers/workout/:memberId
// @access  Private (Trainer)
const getMemberWorkoutPlanByTrainer = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!global.dbConnected) {
      let plan = mockDb.workouts.find(w => w.memberId === memberId && w.trainerId === req.user.id);
      if (!plan) {
        plan = {
          memberId,
          trainerId: req.user.id,
          title: 'Custom Workout Plan',
          days: []
        };
      }
      return res.json({ success: true, data: plan });
    }

    let plan = await WorkoutPlan.findOne({ memberId, trainerId: req.user.id });
    if (!plan) {
      plan = {
        memberId,
        trainerId: req.user.id,
        title: 'Custom Workout Plan',
        days: []
      };
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update workout plan for member
// @route   POST /api/trainers/workout
// @access  Private (Trainer)
const createOrUpdateWorkoutPlan = async (req, res) => {
  const { memberId, title, days } = req.body;

  if (!memberId || !title || !days) {
    return res.status(400).json({ success: false, message: 'Please provide memberId, plan title, and days array' });
  }

  try {
    if (!global.dbConnected) {
      const member = helpers.findUserById(memberId);
      if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

      let plan = mockDb.workouts.find(w => w.memberId === memberId);
      if (plan) {
        plan.title = title;
        plan.days = days;
        plan.trainerId = req.user.id;
      } else {
        plan = {
          _id: `work_${Math.random().toString(36).substr(2, 9)}`,
          memberId,
          trainerId: req.user.id,
          title,
          days
        };
        mockDb.workouts.push(plan);
      }

      if (!member.assignedTrainer) {
        member.assignedTrainer = req.user.id;
      }

      return res.json({ success: true, message: 'Workout plan saved successfully', data: plan });
    }

    // MongoDB Flow
    const member = await User.findById(memberId);
    if (!member || member.role !== 'member') {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    let plan = await WorkoutPlan.findOne({ memberId });
    if (plan) {
      plan.title = title;
      plan.days = days;
      plan.trainerId = req.user.id;
      await plan.save();
    } else {
      plan = await WorkoutPlan.create({
        memberId,
        trainerId: req.user.id,
        title,
        days
      });
    }

    if (!member.assignedTrainer) {
      member.assignedTrainer = req.user.id;
      await member.save();
    }

    res.status(200).json({ success: true, message: 'Workout plan saved successfully', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log progress for a member (BMI, weight)
// @route   POST /api/trainers/progress
// @access  Private (Trainer)
const recordMemberProgress = async (req, res) => {
  const { memberId, weight, height, bodyFat } = req.body;

  if (!memberId || !weight || !height) {
    return res.status(400).json({ success: false, message: 'Please provide memberId, weight (kg), and height (cm)' });
  }

  try {
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

    if (!global.dbConnected) {
      const newRecord = {
        _id: `bmi_${Math.random().toString(36).substr(2, 9)}`,
        memberId,
        weight,
        height,
        bmi,
        bodyFat: bodyFat || null,
        recordedAt: new Date()
      };
      mockDb.bmiRecords.push(newRecord);
      return res.status(201).json({ success: true, message: 'Progress recorded successfully', data: newRecord });
    }

    const newRecord = await BMIRecords.create({
      memberId,
      weight,
      height,
      bmi,
      bodyFat: bodyFat || null
    });

    res.status(201).json({ success: true, message: 'Progress recorded successfully', data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get training bookings for trainer
// @route   GET /api/trainers/bookings
// @access  Private (Trainer)
const getTrainerBookings = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const bookings = mockDb.bookings.filter(b => b.trainerId === req.user.id);
      const populated = bookings.map(b => {
        const member = helpers.findUserById(b.memberId);
        return {
          ...b,
          memberId: member ? { _id: member._id, name: member.name, email: member.email, profilePicture: member.profilePicture, phone: member.phone } : null
        };
      });
      return res.json({ success: true, data: populated });
    }

    const bookings = await Booking.find({ trainerId: req.user.id })
      .populate('memberId', 'name email profilePicture phone')
      .sort({ date: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update session booking status
// @route   PUT /api/trainers/bookings/:id
// @access  Private (Trainer)
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid booking status' });
  }

  try {
    if (!global.dbConnected) {
      const booking = mockDb.bookings.find(b => b._id === req.params.id && b.trainerId === req.user.id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      booking.status = status;
      return res.json({ success: true, message: `Booking status updated to ${status}`, data: booking });
    }

    const booking = await Booking.findOne({ _id: req.params.id, trainerId: req.user.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: `Booking status updated to ${status}`, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get details and progress history of an assigned member
// @route   GET /api/trainers/members/:memberId/progress
// @access  Private (Trainer)
const getMemberProgressHistory = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const bmiHistory = helpers.findBmiHistory(req.params.memberId);
      const attendanceHistory = helpers.findAttendanceByMemberId(req.params.memberId);
      return res.json({
        success: true,
        data: {
          bmiHistory,
          attendanceHistory
        }
      });
    }

    const bmiHistory = await BMIRecords.find({ memberId: req.params.memberId }).sort({ recordedAt: 1 });
    const attendanceHistory = await Attendance.find({ memberId: req.params.memberId }).sort({ date: -1 });
    
    res.json({
      success: true,
      data: {
        bmiHistory,
        attendanceHistory
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTrainerDashboard,
  getAssignedMembers,
  getMemberWorkoutPlanByTrainer,
  createOrUpdateWorkoutPlan,
  recordMemberProgress,
  getTrainerBookings,
  updateBookingStatus,
  getMemberProgressHistory
};
