import api from './api';

const notificationService = {
  /**
   * Get all notifications for the authenticated user.
   */
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data?.data?.notifications || [];
  },

  /**
   * Get unread notification count.
   */
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data?.data?.count ?? 0;
  },

  /**
   * Mark a single notification as read.
   * @param {string} notificationId
   */
  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data?.data?.notification;
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a single notification.
   * @param {string} notificationId
   */
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Delete all notifications (clear log).
   */
  async deleteAllNotifications() {
    const response = await api.delete('/notifications');
    return response.data;
  },
};

export default notificationService;
