const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all routes
router.use(protect);

router.route('/')
  .get(notificationController.get)
  .delete(notificationController.deleteAll);

router.route('/unread-count')
  .get(notificationController.getUnreadCount);

router.route('/read-all')
  .patch(notificationController.markAllAsRead);

router.route('/:notificationId/read')
  .patch(notificationController.markAsRead);

router.route('/:notificationId')
  .delete(notificationController.deleteOne);

module.exports = router;
