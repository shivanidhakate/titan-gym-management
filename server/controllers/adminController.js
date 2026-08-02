const User = require('../models/User');
const Booking = require('../models/Booking');
const MembershipPlan = require('../models/MembershipPlan');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const { mockDb, helpers } = require('../utils/mockDb');
const bcrypt = require('bcryptjs');

// @desc    Get admin dashboard metrics & stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboard = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const totalMembers = mockDb.users.filter(u => u.role === 'member').length;
      const activeMembers = mockDb.users.filter(u => u.role === 'member' && u.activeMembership.status === 'active').length;
      const totalTrainers = mockDb.users.filter(u => u.role === 'trainer').length;

      // Revenue
      const completedPayments = mockDb.payments.filter(p => p.status === 'completed');
      const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

      // Plans Breakdown
      const planSalesMap = {};
      completedPayments.forEach(p => {
        planSalesMap[p.planId] = planSalesMap[p.planId] || { count: 0, revenue: 0 };
        planSalesMap[p.planId].count += 1;
        planSalesMap[p.planId].revenue += p.amount;
      });

      const plansSalesBreakdown = Object.keys(planSalesMap).map(pId => {
        const plan = helpers.findPlanById(pId);
        return {
          name: plan ? plan.name : 'Unknown Plan',
          count: planSalesMap[pId].count,
          revenue: planSalesMap[pId].revenue
        };
      });

      // Today's attendance
      const startOfToday = new Date().setHours(0,0,0,0);
      const endOfToday = new Date().setHours(23,59,59,999);
      const todaysAttendanceCount = mockDb.attendance.filter(a => 
        a.status === 'present' && new Date(a.date) >= startOfToday && new Date(a.date) <= endOfToday
      ).length;

      // Recent payments
      const recentPayments = [...mockDb.payments]
        .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
        .slice(0, 5)
        .map(p => {
          const member = helpers.findUserById(p.memberId);
          const plan = helpers.findPlanById(p.planId);
          return {
            ...p,
            memberId: member ? { name: member.name, email: member.email } : null,
            planId: plan ? { name: plan.name } : null
          };
        });

      const activeDistribution = {
        active: activeMembers,
        expired: mockDb.users.filter(u => u.role === 'member' && u.activeMembership.status === 'expired').length,
        none: mockDb.users.filter(u => u.role === 'member' && u.activeMembership.status === 'none').length,
      };

      return res.json({
        success: true,
        data: {
          totalMembers,
          activeMembers,
          totalTrainers,
          totalRevenue,
          todaysAttendanceCount,
          plansSalesBreakdown,
          recentPayments,
          activeDistribution
        }
      });
    }

    // MongoDB Flow
    const totalMembers = await User.countDocuments({ role: 'member' });
    const activeMembers = await User.countDocuments({ role: 'member', 'activeMembership.status': 'active' });
    const totalTrainers = await User.countDocuments({ role: 'trainer' });

    const revenueResult = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const planSalesCount = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$planId', count: { $sum: 1 }, totalRevenue: { $sum: '$amount' } } }
    ]);

    const plansSalesBreakdown = [];
    for (const item of planSalesCount) {
      if (item._id) {
        const plan = await MembershipPlan.findById(item._id);
        plansSalesBreakdown.push({
          name: plan ? plan.name : 'Unknown Plan',
          count: item.count,
          revenue: item.totalRevenue
        });
      }
    }

    const startOfToday = new Date().setHours(0,0,0,0);
    const endOfToday = new Date().setHours(23,59,59,999);
    const todaysAttendanceCount = await Attendance.countDocuments({
      status: 'present',
      date: { $gte: startOfToday, $lte: endOfToday }
    });

    const recentPayments = await Payment.find()
      .populate('memberId', 'name email')
      .populate('planId', 'name')
      .sort({ transactionDate: -1 })
      .limit(5);

    const activeDistribution = {
      active: activeMembers,
      expired: await User.countDocuments({ role: 'member', 'activeMembership.status': 'expired' }),
      none: await User.countDocuments({ role: 'member', 'activeMembership.status': 'none' }),
    };

    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        totalTrainers,
        totalRevenue,
        todaysAttendanceCount,
        plansSalesBreakdown,
        recentPayments,
        activeDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= MEMBER CRUD =================

const getMembers = async (req, res) => {
  try {
    const { search } = req.query;

    if (!global.dbConnected) {
      let members = mockDb.users.filter(u => u.role === 'member');
      if (search) {
        members = members.filter(u => 
          u.name.toLowerCase().includes(search.toLowerCase()) || 
          u.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Populate mock properties
      const populatedMembers = members.map(m => {
        const trainer = helpers.findUserById(m.assignedTrainer);
        const plan = helpers.findPlanById(m.activeMembership?.planId);
        return {
          ...m,
          assignedTrainer: trainer ? { name: trainer.name } : null,
          activeMembership: {
            ...m.activeMembership,
            planId: plan ? { name: plan.name } : null
          }
        };
      });

      return res.json({ success: true, data: populatedMembers });
    }

    // MongoDB Flow
    let query = { role: 'member' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await User.find(query)
      .populate('assignedTrainer', 'name')
      .populate('activeMembership.planId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMemberById = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const member = helpers.findUserById(req.params.id);
      if (!member || member.role !== 'member') {
        return res.status(404).json({ success: false, message: 'Member not found' });
      }
      const trainer = helpers.findUserById(member.assignedTrainer);
      const plan = helpers.findPlanById(member.activeMembership?.planId);
      const populated = {
        ...member,
        assignedTrainer: trainer ? { _id: trainer._id, name: trainer.name } : null,
        activeMembership: {
          ...member.activeMembership,
          planId: plan ? { _id: plan._id, name: plan.name } : null
        }
      };
      return res.json({ success: true, data: populated });
    }

    const member = await User.findOne({ _id: req.params.id, role: 'member' })
      .populate('assignedTrainer', 'name')
      .populate('activeMembership.planId', 'name');

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const { name, email, phone, address, assignedTrainer, membershipStatus, membershipPlanId, membershipEndDate } = req.body;

    if (!global.dbConnected) {
      const member = mockDb.users.find(u => u._id === req.params.id && u.role === 'member');
      if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

      member.name = name || member.name;
      member.email = email || member.email;
      member.phone = phone !== undefined ? phone : member.phone;
      member.address = address !== undefined ? address : member.address;
      if (assignedTrainer !== undefined) {
        member.assignedTrainer = assignedTrainer === '' ? null : assignedTrainer;
      }
      if (membershipStatus || membershipPlanId) {
        member.activeMembership.status = membershipStatus || member.activeMembership.status;
        if (membershipPlanId !== undefined) {
          member.activeMembership.planId = membershipPlanId === '' ? null : membershipPlanId;
        }
        if (membershipEndDate) {
          member.activeMembership.endDate = new Date(membershipEndDate);
        }
      }

      return res.json({ success: true, message: 'Member updated successfully', data: member });
    }

    // MongoDB Flow
    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    member.name = name || member.name;
    member.email = email || member.email;
    member.phone = phone !== undefined ? phone : member.phone;
    member.address = address !== undefined ? address : member.address;
    if (assignedTrainer !== undefined) {
      member.assignedTrainer = assignedTrainer === '' ? null : assignedTrainer;
    }
    if (membershipStatus || membershipPlanId) {
      member.activeMembership.status = membershipStatus || member.activeMembership.status;
      if (membershipPlanId !== undefined) {
        member.activeMembership.planId = membershipPlanId === '' ? null : membershipPlanId;
      }
      if (membershipEndDate) {
        member.activeMembership.endDate = new Date(membershipEndDate);
      }
    }

    const updated = await member.save();
    res.json({ success: true, message: 'Member updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const idx = mockDb.users.findIndex(u => u._id === req.params.id && u.role === 'member');
      if (idx === -1) return res.status(404).json({ success: false, message: 'Member not found' });
      mockDb.users.splice(idx, 1);
      return res.json({ success: true, message: 'Member deleted successfully' });
    }

    const member = await User.findOneAndDelete({ _id: req.params.id, role: 'member' });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const resetUserPassword = async (req, res) => {
  const { newPassword } = req.body;

  try {
    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide a new password' });
    }

    if (!global.dbConnected) {
      const user = mockDb.users.find(u => u._id === req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(newPassword, salt);
      return res.json({ success: true, message: `${user.role} password updated successfully` });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.password = newPassword;
    await user.save();
    return res.json({ success: true, message: `${user.role} password updated successfully` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// ================= TRAINER CRUD =================

const getTrainers = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const trainers = mockDb.users.filter(u => u.role === 'trainer');
      return res.json({ success: true, data: trainers });
    }

    const trainers = await User.find({ role: 'trainer' }).sort({ createdAt: -1 });
    res.json({ success: true, data: trainers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTrainer = async (req, res) => {
  const { name, email, password, phone, address, trainerSpecialties, trainerBio, trainerRate } = req.body;

  try {
    if (!global.dbConnected) {
      const exists = helpers.findUserByEmail(email);
      if (exists) return res.status(400).json({ success: false, message: 'User already exists' });

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const trainer = {
        _id: `user_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password: hashedPassword,
        role: 'trainer',
        phone: phone || '',
        address: address || '',
        trainerSpecialties: trainerSpecialties || [],
        trainerBio: trainerBio || '',
        trainerRate: trainerRate || 0,
        trainerStatus: 'active',
        profilePicture: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=200'
      };

      mockDb.users.push(trainer);
      return res.status(201).json({ success: true, message: 'Trainer account created', data: trainer });
    }

    const trainerExists = await User.findOne({ email });
    if (trainerExists) {
      return res.status(400).json({ success: false, message: 'User already exists with that email' });
    }

    const trainer = await User.create({
      name,
      email,
      password,
      role: 'trainer',
      phone: phone || '',
      address: address || '',
      trainerSpecialties: trainerSpecialties || [],
      trainerBio: trainerBio || '',
      trainerRate: trainerRate || 0,
      trainerStatus: 'active'
    });

    res.status(201).json({ success: true, message: 'Trainer account created', data: trainer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTrainer = async (req, res) => {
  try {
    const { name, email, phone, address, trainerSpecialties, trainerBio, trainerRate, trainerStatus } = req.body;

    if (!global.dbConnected) {
      const trainer = mockDb.users.find(u => u._id === req.params.id && u.role === 'trainer');
      if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

      trainer.name = name || trainer.name;
      trainer.email = email || trainer.email;
      trainer.phone = phone !== undefined ? phone : trainer.phone;
      trainer.address = address !== undefined ? address : trainer.address;
      trainer.trainerSpecialties = trainerSpecialties || trainer.trainerSpecialties;
      trainer.trainerBio = trainerBio !== undefined ? trainerBio : trainer.trainerBio;
      trainer.trainerRate = trainerRate !== undefined ? trainerRate : trainer.trainerRate;
      trainer.trainerStatus = trainerStatus || trainer.trainerStatus;

      return res.json({ success: true, message: 'Trainer profile updated successfully', data: trainer });
    }

    // MongoDB Flow
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' });
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    trainer.name = name || trainer.name;
    trainer.email = email || trainer.email;
    trainer.phone = phone !== undefined ? phone : trainer.phone;
    trainer.address = address !== undefined ? address : trainer.address;
    trainer.trainerSpecialties = trainerSpecialties || trainer.trainerSpecialties;
    trainer.trainerBio = trainerBio !== undefined ? trainerBio : trainer.trainerBio;
    trainer.trainerRate = trainerRate !== undefined ? trainerRate : trainer.trainerRate;
    trainer.trainerStatus = trainerStatus || trainer.trainerStatus;

    const updated = await trainer.save();
    res.json({ success: true, message: 'Trainer profile updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTrainer = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const idx = mockDb.users.findIndex(u => u._id === req.params.id && u.role === 'trainer');
      if (idx === -1) return res.status(404).json({ success: false, message: 'Trainer not found' });
      mockDb.users.splice(idx, 1);
      return res.json({ success: true, message: 'Trainer account deleted successfully' });
    }

    const trainer = await User.findOneAndDelete({ _id: req.params.id, role: 'trainer' });
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    res.json({ success: true, message: 'Trainer account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= PLANS CRUD =================

const getAdminPlans = async (req, res) => {
  try {
    if (!global.dbConnected) {
      return res.json({ success: true, data: mockDb.plans });
    }
    const plans = await MembershipPlan.find().sort({ price: 1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPlan = async (req, res) => {
  const { name, description, durationMonths, price, features } = req.body;

  if (!name || !description || !durationMonths || !price) {
    return res.status(400).json({ success: false, message: 'Please provide name, description, duration, and price' });
  }

  try {
    if (!global.dbConnected) {
      const plan = {
        _id: `plan_${Math.random().toString(36).substr(2, 9)}`,
        name, description, durationMonths, price, features: features || [],
        isActive: true
      };
      mockDb.plans.push(plan);
      return res.status(201).json({ success: true, message: 'Plan created successfully', data: plan });
    }

    const newPlan = await MembershipPlan.create({
      name,
      description,
      durationMonths,
      price,
      features: features || []
    });

    res.status(201).json({ success: true, message: 'Plan created successfully', data: newPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    const { name, description, durationMonths, price, features, isActive } = req.body;

    if (!global.dbConnected) {
      const plan = mockDb.plans.find(p => p._id === req.params.id);
      if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

      plan.name = name || plan.name;
      plan.description = description || plan.description;
      plan.durationMonths = durationMonths !== undefined ? durationMonths : plan.durationMonths;
      plan.price = price !== undefined ? price : plan.price;
      plan.features = features || plan.features;
      if (isActive !== undefined) plan.isActive = isActive;

      return res.json({ success: true, message: 'Plan updated successfully', data: plan });
    }

    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    plan.name = name || plan.name;
    plan.description = description || plan.description;
    plan.durationMonths = durationMonths !== undefined ? durationMonths : plan.durationMonths;
    plan.price = price !== undefined ? price : plan.price;
    plan.features = features || plan.features;
    if (isActive !== undefined) plan.isActive = isActive;

    const updated = await plan.save();
    res.json({ success: true, message: 'Plan updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePlan = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const idx = mockDb.plans.findIndex(p => p._id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Plan not found' });
      mockDb.plans.splice(idx, 1);
      return res.json({ success: true, message: 'Plan deleted successfully' });
    }

    const plan = await MembershipPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= BOOKINGS & PAYMENTS =================

const getAdminBookings = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const populated = mockDb.bookings.map(b => {
        const member = helpers.findUserById(b.memberId);
        const trainer = helpers.findUserById(b.trainerId);
        return {
          ...b,
          memberId: member ? { _id: member._id, name: member.name, email: member.email, profilePicture: member.profilePicture } : null,
          trainerId: trainer ? { _id: trainer._id, name: trainer.name, profilePicture: trainer.profilePicture, trainerSpecialties: trainer.trainerSpecialties } : null
        };
      });
      return res.json({ success: true, data: populated });
    }

    const bookings = await Booking.find()
      .populate('memberId', 'name email profilePicture')
      .populate('trainerId', 'name profilePicture trainerSpecialties')
      .sort({ date: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminPayments = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const populated = mockDb.payments.map(p => {
        const member = helpers.findUserById(p.memberId);
        const plan = helpers.findPlanById(p.planId);
        return {
          ...p,
          memberId: member ? { name: member.name, email: member.email } : null,
          planId: plan ? { name: plan.name } : null
        };
      });
      return res.json({ success: true, data: populated });
    }

    const payments = await Payment.find()
      .populate('memberId', 'name email')
      .populate('planId', 'name')
      .sort({ transactionDate: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  resetUserPassword,
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getAdminPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getAdminBookings,
  getAdminPayments
};
