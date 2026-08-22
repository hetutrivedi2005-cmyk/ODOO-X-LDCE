const notificationService = require('../services/notification.service');

/**
 * Fetch all notifications of the authenticated user.
 */
const get = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notifications count.
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const data = await notificationService.getUnreadCount(req.user.id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read.
 */
const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await notificationService.markAsRead(req.user.id, notificationId);
    return res.status(200).json({
      success: true,
      data: {
        notification,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Mark all notifications of the authenticated user as read.
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a single notification.
 */
const deleteOne = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    await notificationService.deleteNotification(req.user.id, notificationId);
    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Delete all notifications of the user.
 */
const deleteAll = async (req, res, next) => {
  try {
    await notificationService.deleteAllNotifications(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'All notifications cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteOne,
  deleteAll,
};
