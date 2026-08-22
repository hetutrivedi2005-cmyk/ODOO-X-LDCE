import api from './api';

export const adminService = {
  /**
   * Fetch platform overview metrics
   */
  async getAdminOverview() {
    try {
      const response = await api.get('/admin/overview');
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.warn('Admin overview fetch failed, returning fallback metrics:', error.message);
      return {
        users: { total: 0, active: 0, inactive: 0 },
        trips: { total: 0, completed: 0, active: 0 },
        expenses: { totalAmount: 0 },
        notifications: { total: 0 },
        recentActivity: [],
      };
    }
  },

  /**
   * Fetch user list with search and filters
   * @param {Object} params - { page, limit, search, role, status }
   */
  async getUsers(params = {}) {
    try {
      const response = await api.get('/admin/users', { params });
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.warn('Admin users fetch failed:', error.message);
      return { users: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    }
  },

  /**
   * Fetch user detail by ID
   * @param {string} userId
   */
  async getUserDetails(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      const data = response.data?.data || response.data;
      return data.user || data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user status (ACTIVE/INACTIVE) or role (ADMIN/USER)
   * @param {string} userId
   * @param {Object} statusData - { status, role }
   */
  async updateUserStatus(userId, statusData) {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, statusData);
      const data = response.data?.data || response.data;
      return data.user || data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch platform trips list
   * @param {Object} params - { page, limit, search }
   */
  async getTrips(params = {}) {
    try {
      const response = await api.get('/admin/trips', { params });
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.warn('Admin trips fetch failed:', error.message);
      return { trips: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    }
  },

  /**
   * Fetch system activity logs
   * @param {Object} params - { page, limit, action, entityType, userId }
   */
  async getActivityLogs(params = {}) {
    try {
      const response = await api.get('/admin/activity', { params });
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.warn('Admin activity fetch failed:', error.message);
      return { activityLogs: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    }
  },

  /**
   * Fetch administrative reports & system analytics
   */
  async getAdminReports() {
    try {
      const response = await api.get('/admin/reports');
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.warn('Admin reports fetch failed:', error.message);
      return {
        userStats: [],
        tripStats: 0,
        expenseOverview: { totalAmount: 0, averageExpense: 0, totalCount: 0 },
        categoryExpenses: [],
      };
    }
  },
};

export default adminService;
