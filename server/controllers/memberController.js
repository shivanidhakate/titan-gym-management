const User = require('../models/User');
const Booking = require('../models/Booking');
const WorkoutPlan = require('../models/WorkoutPlan');
const Attendance = require('../models/Attendance');
const BMIRecords = require('../models/BMIRecords');
const MembershipPlan = require('../models/MembershipPlan');
const { mockDb, helpers } = require('../utils/mockDb');

// @desc    Get member dashboard summary
// @route   GET /api/members/dashboard
// @access  Private (Member)
const getMemberDashboard = async (req, res) => {
  try {
    const memberId = req.user.id;

    if (!global.dbConnected) {
      const user = helpers.findUserById(memberId);
      const attendance = helpers.findAttendanceByMemberId(memberId);
      const totalPresent = attendance.filter(a => a.status === 'present').length;
      const attendancePercentage = totalPresent > 0 ? Math.min(100, Math.round((totalPresent / 24) * 100)) : 0;

      // Find plan details
      let planDetails = null;
      if (user.activeMembership && user.activeMembership.planId) {
        planDetails = helpers.findPlanById(user.activeMembership.planId);
      }

      // Today's workout
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const workoutPlan = helpers.findWorkoutByMemberId(memberId);
      let todaysWorkout = null;
      if (workoutPlan && workoutPlan.days) {
        const todayDayPlan = workoutPlan.days.find(d => d.day.toLowerCase() === today.toLowerCase());
        if (todayDayPlan) {
          todaysWorkout = {
            title: workoutPlan.title,
            exercises: todayDayPlan.exercises
          };
        }
      }

      // Next session
      const startOfToday = new Date().setHours(0,0,0,0);
      const nextSession = mockDb.bookings
        .filter(b => b.memberId === memberId && b.status === 'approved' && new Date(b.date) >= startOfToday)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      
      let populatedNextSession = null;
      if (nextSession) {
        const trainer = helpers.findUserById(nextSession.trainerId);
        populatedNextSession = {
          ...nextSession,
          trainerId: trainer ? { _id: trainer._id, name: trainer.name, profilePicture: trainer.profilePicture } : null
        };
      }

      // Latest BMI
      const bmiHistory = helpers.findBmiHistory(memberId);
      const latestBMI = bmiHistory.length > 0 ? bmiHistory[bmiHistory.length - 1] : null;

      return res.json({
        success: true,
        data: {
          membership: {
            ...user.activeMembership,
            planId: planDetails
          },
          attendancePercentage,
          todaysWorkout,
          nextSession: populatedNextSession,
          latestBMI: latestBMI ? { bmi: latestBMI.bmi, weight: latestBMI.weight, bodyFat: latestBMI.bodyFat } : null
        }
      });
    }

    // MongoDB Flow
    const user = await User.findById(memberId).populate('activeMembership.planId');
    const totalPresent = await Attendance.countDocuments({ memberId, status: 'present' });
    const attendancePercentage = totalPresent > 0 ? Math.min(100, Math.round((totalPresent / 24) * 100)) : 0;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const workoutPlan = await WorkoutPlan.findOne({ memberId });
    let todaysWorkout = null;
    if (workoutPlan && workoutPlan.days) {
      const todayDayPlan = workoutPlan.days.find(d => d.day.toLowerCase() === today.toLowerCase());
      if (todayDayPlan) {
        todaysWorkout = {
          title: workoutPlan.title,
          exercises: todayDayPlan.exercises
        };
      }
    }

    const nextSession = await Booking.findOne({
      memberId,
      status: 'approved',
      date: { $gte: new Date().setHours(0,0,0,0) }
    })
    .sort({ date: 1 })
    .populate('trainerId', 'name profilePicture trainerSpecialties');

    const latestBMI = await BMIRecords.findOne({ memberId }).sort({ recordedAt: -1 });

    res.json({
      success: true,
      data: {
        membership: user.activeMembership,
        attendancePercentage,
        todaysWorkout,
        nextSession,
        latestBMI: latestBMI ? { bmi: latestBMI.bmi, weight: latestBMI.weight, bodyFat: latestBMI.bodyFat } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update member profile
// @route   PUT /api/members/profile
// @access  Private (Member)
const updateMemberProfile = async (req, res) => {
  try {
    const { name, phone, address, gender, dob } = req.body;

    // If a file was uploaded via Multer+Cloudinary, req.file.path = the Cloudinary URL
    // If Cloudinary is not configured, req.file will be undefined (memory storage used as fallback)
    const uploadedImageUrl = req.file ? (req.file.path || req.file.originalname) : null;

    if (!global.dbConnected) {
      const user = helpers.findUserById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      user.gender = gender || user.gender;
      user.dob = dob || user.dob;
      if (uploadedImageUrl) user.profilePicture = uploadedImageUrl;

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    if (uploadedImageUrl) user.profilePicture = uploadedImageUrl;

    const updatedUser = await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log a new BMI record
// @route   POST /api/members/bmi
// @access  Private (Member)
const logBMIRecord = async (req, res) => {
  const { weight, height, bodyFat } = req.body;

  if (!weight || !height) {
    return res.status(400).json({ success: false, message: 'Please provide weight in kg and height in cm' });
  }

  try {
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

    if (!global.dbConnected) {
      const newRecord = {
        _id: `bmi_${Math.random().toString(36).substr(2, 9)}`,
        memberId: req.user.id,
        weight,
        height,
        bmi,
        bodyFat: bodyFat || null,
        recordedAt: new Date()
      };
      mockDb.bmiRecords.push(newRecord);
      return res.status(201).json({
        success: true,
        message: 'Progress recorded successfully',
        data: newRecord
      });
    }

    const newRecord = await BMIRecords.create({
      memberId: req.user.id,
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

// @desc    Get member BMI history
// @route   GET /api/members/bmi
// @access  Private (Member)
const getBMIHistory = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const history = helpers.findBmiHistory(req.user.id);
      return res.json({ success: true, data: history });
    }

    const history = await BMIRecords.find({ memberId: req.user.id }).sort({ recordedAt: 1 });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainers list
// @route   GET /api/members/trainers
// @access  Private (Member)
const getTrainers = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const trainers = mockDb.users.filter(u => u.role === 'trainer' && u.trainerStatus === 'active');
      return res.json({ success: true, data: trainers });
    }

    const trainers = await User.find({ role: 'trainer', trainerStatus: 'active' })
      .select('name email phone profilePicture trainerSpecialties trainerBio trainerRate');
    res.json({ success: true, data: trainers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Book training session
// @route   POST /api/members/bookings
// @access  Private (Member)
const bookTrainerSession = async (req, res) => {
  const { trainerId, date, timeSlot, notes } = req.body;

  if (!trainerId || !date || !timeSlot) {
    return res.status(400).json({ success: false, message: 'Trainer, date, and time slot are required' });
  }

  try {
    if (!global.dbConnected) {
      const booking = {
        _id: `book_${Math.random().toString(36).substr(2, 9)}`,
        memberId: req.user.id,
        trainerId,
        date: new Date(date),
        timeSlot,
        status: 'pending',
        notes: notes || ''
      };
      mockDb.bookings.push(booking);
      return res.status(201).json({
        success: true,
        message: 'Booking request sent successfully',
        data: booking
      });
    }

    const booking = await Booking.create({
      memberId: req.user.id,
      trainerId,
      date,
      timeSlot,
      notes: notes || ''
    });

    res.status(201).json({ success: true, message: 'Booking request sent successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel training booking
// @route   PUT /api/members/bookings/:id/cancel
// @access  Private (Member)
const cancelBooking = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const booking = mockDb.bookings.find(b => b._id === req.params.id && b.memberId === req.user.id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      booking.status = 'cancelled';
      return res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
    }

    const booking = await Booking.findOne({ _id: req.params.id, memberId: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get member's training bookings
// @route   GET /api/members/bookings
// @access  Private (Member)
const getMemberBookings = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const bookings = mockDb.bookings.filter(b => b.memberId === req.user.id);
      const populatedBookings = bookings.map(b => {
        const trainer = helpers.findUserById(b.trainerId);
        return {
          ...b,
          trainerId: trainer ? { _id: trainer._id, name: trainer.name, profilePicture: trainer.profilePicture, trainerSpecialties: trainer.trainerSpecialties } : null
        };
      });
      return res.json({ success: true, data: populatedBookings });
    }

    const bookings = await Booking.find({ memberId: req.user.id })
      .populate('trainerId', 'name profilePicture trainerSpecialties')
      .sort({ date: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get workout plan
// @route   GET /api/members/workout
// @access  Private (Member)
const getMemberWorkoutPlan = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const plan = helpers.findWorkoutByMemberId(req.user.id);
      let populatedPlan = null;
      if (plan) {
        const trainer = helpers.findUserById(plan.trainerId);
        populatedPlan = {
          ...plan,
          trainerId: trainer ? { name: trainer.name, email: trainer.email, profilePicture: trainer.profilePicture } : null
        };
      }
      return res.json({ success: true, data: populatedPlan });
    }

    const plan = await WorkoutPlan.findOne({ memberId: req.user.id })
      .populate('trainerId', 'name email profilePicture');
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get member attendance history
// @route   GET /api/members/attendance
// @access  Private (Member)
const getMemberAttendance = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const list = helpers.findAttendanceByMemberId(req.user.id);
      return res.json({ success: true, data: list });
    }

    const attendance = await Attendance.find({ memberId: req.user.id }).sort({ date: -1 });
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
