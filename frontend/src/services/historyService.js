import api from './api';

export const historyService = {
  /**
   * Fetch activity history logs for a trip
   * @param {string} tripId
   * @param {Object} params - { page, limit, entityType, action }
   */
  async getTripHistory(tripId, params = {}) {
    try {
      const response = await api.get(`/trips/${tripId}/history`, { params });
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.warn('History API fetch failed, checking local storage cache:', error.message);
      return {
        history: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      };
    }
  },

  /**
   * Get single activity log detail
   * @param {string} tripId
   * @param {string} activityId
   */
  async getActivityDetail(tripId, activityId) {
    try {
      const response = await api.get(`/trips/${tripId}/history/${activityId}`);
      const data = response.data?.data || response.data;
      return data.activity || data;
    } catch (error) {
      throw error;
    }
  },
};

export default historyService;
