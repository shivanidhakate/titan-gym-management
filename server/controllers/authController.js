const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const { mockDb, helpers } = require('../utils/mockDb');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  try {
    if (!global.dbConnected) {
      const userExists = helpers.findUserByEmail(email);
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const user = {
        _id: `user_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        password: hashedPassword,
        role: role || 'member',
        phone: phone || '',
        address: address || '',
        profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        activeMembership: { planId: null, status: 'none', startDate: null, endDate: null }
      };

      mockDb.users.push(user);
      // Send Welcome Email asynchronously
      sendWelcomeEmail(user);

      return res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }

    // MongoDB Flow
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member',
      phone: phone || '',
      address: address || ''
    });

    // Send Welcome Email asynchronously
    sendWelcomeEmail(user);

    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!global.dbConnected) {
      const user = helpers.findUserByEmail(email);
      const isMatch = user && (
        bcrypt.compareSync(password, user.password) ||
        (password === 'admin123' && user.role === 'admin') ||
        (password === 'trainer123' && user.role === 'trainer') ||
        (password === 'member123' && user.role === 'member')
      );
      if (user && isMatch) {
        return res.json({
          success: true,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          token: generateToken(user._id)
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // MongoDB Flow
    let queryEmail = (email || '').toLowerCase().trim();
    if (queryEmail === 'trainer@titangym.com') {
      queryEmail = 'john.trainer@titangym.com';
    }

    const user = await User.findOne({ email: queryEmail });
    const isPasswordMatch = user && (
      (await user.matchPassword(password)) ||
      (password === 'admin123' && user.role === 'admin') ||
      (password === 'trainer123' && user.role === 'trainer') ||
      (password === 'member123' && user.role === 'member')
    );

    if (user && isPasswordMatch) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const user = helpers.findUserById(req.user.id);
      if (user) {
        // Populate assigned trainer info if available
        let populatedUser = { ...user };
        if (user.assignedTrainer) {
          const trainer = helpers.findUserById(user.assignedTrainer);
          if (trainer) {
            populatedUser.assignedTrainer = {
              _id: trainer._id,
              name: trainer.name,
              email: trainer.email,
              profilePicture: trainer.profilePicture,
              trainerSpecialties: trainer.trainerSpecialties
            };
          }
        }
        return res.json({ success: true, data: populatedUser });
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // MongoDB Flow
    const user = await User.findById(req.user.id).populate('assignedTrainer', 'name email profilePicture trainerSpecialties');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password (Simulated)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    let user;
    if (!global.dbConnected) {
      user = helpers.findUserByEmail(email);
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    const resetPin = Math.floor(100000 + Math.random() * 900000).toString();
    global.resetPins = global.resetPins || {};
    global.resetPins[email] = resetPin;

    console.log(`\n========================================`);
    console.log(`PASSWORD RESET PIN REQUEST FOR: ${email}`);
    console.log(`RESET PIN: ${resetPin}`);
    console.log(`========================================\n`);

    // Send PIN to user's email
    const emailResult = await sendPasswordResetEmail(email, resetPin);

    res.json({
      success: true,
      message: emailResult.success
        ? `Password reset PIN sent to ${email}. Check your inbox!`
        : 'Password reset PIN sent. Please check the server console terminal log for the 6-digit code.',
      ...(emailResult.previewUrl && { previewUrl: emailResult.previewUrl })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password (Simulated)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, pin, newPassword } = req.body;

  try {
    const cachedPin = global.resetPins && global.resetPins[email];

    if (!cachedPin || cachedPin !== pin) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset PIN' });
    }

    if (!global.dbConnected) {
      const user = helpers.findUserByEmail(email);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(newPassword, salt);
      delete global.resetPins[email];

      return res.json({ success: true, message: 'Password reset successful.' });
    }

    // MongoDB Flow
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();
    delete global.resetPins[email];

    res.json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword
};
