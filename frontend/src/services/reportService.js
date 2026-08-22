import api from './api';

export const reportService = {
  /**
   * Fetches the overall KPIs and summary.
   * @param {Object} params - { tripId, category, startDate, endDate }
   */
  async getOverview(params) {
    const response = await api.get('/reports/overview', { params });
    return response.data?.data?.overview || response.data;
  },

  /**
   * Fetches expense breakdown categories, averages, and periods.
   * @param {Object} params - { tripId, category, startDate, endDate }
   */
  async getExpenseAnalytics(params) {
    const response = await api.get('/reports/expenses', { params });
    return response.data?.data?.expenses || response.data;
  },

  /**
   * Fetches destination stats (visited countries/cities counts and lists).
   * @param {Object} params - { tripId, category, startDate, endDate }
   */
  async getDestinationAnalytics(params) {
    const response = await api.get('/reports/destinations', { params });
    return response.data?.data?.destinations || response.data;
  },

  /**
   * Fetches trip counts and statuses distribution.
   * @param {Object} params - { tripId, category, startDate, endDate }
   */
  async getTripAnalytics(params) {
    const response = await api.get('/reports/trips', { params });
    return response.data?.data?.trips || response.data;
  },

  /**
   * Fetches activity logs.
   * @param {Object} params - { tripId, category, startDate, endDate }
   */
  async getActivityAnalytics(params) {
    const response = await api.get('/reports/activity', { params });
    return response.data?.data?.activity || response.data;
  }
};

export default reportService;
