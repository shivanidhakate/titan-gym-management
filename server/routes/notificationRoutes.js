const express = require('express');
const router = express.Router();
const { getUserNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getUserNotifications);
router.route('/:id')
  .put(markAsRead)
  .delete(deleteNotification);

module.exports = router;
