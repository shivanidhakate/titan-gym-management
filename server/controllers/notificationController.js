const Notification = require('../models/Notification');
const { mockDb, helpers } = require('../utils/mockDb');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const list = helpers.findNotificationsByUserId(req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, data: list });
    }

    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
const markAsRead = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const notif = mockDb.notifications.find(n => n._id === req.params.id && n.userId === req.user.id);
      if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
      notif.isRead = true;
      return res.json({ success: true, data: notif });
    }

    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    if (!global.dbConnected) {
      const idx = mockDb.notifications.findIndex(n => n._id === req.params.id && n.userId === req.user.id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Notification not found' });
      mockDb.notifications.splice(idx, 1);
      return res.json({ success: true, message: 'Notification cleared' });
    }

    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  deleteNotification
};
