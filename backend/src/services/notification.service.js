const prisma = require('../config/prisma');

/**
 * Create a new notification for a user.
 */
const createNotification = async (userId, { type, title, message, relatedTripId = null, relatedItineraryItemId = null }) => {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      relatedTripId,
      relatedItineraryItemId,
    },
  });
};

/**
 * Get all notifications for a user.
 */
const getNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get unread notification count for a user.
 */
const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
  return { count };
};

/**
 * Mark a single notification as read.
 */
const markAsRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

/**
 * Mark all user notifications as read.
 */
const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

/**
 * Delete a single notification.
 */
const deleteNotification = async (userId, notificationId) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.notification.delete({
    where: { id: notificationId },
  });
};

/**
 * Delete all notifications for a user.
 */
const deleteAllNotifications = async (userId) => {
  return await prisma.notification.deleteMany({
    where: { userId },
  });
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
