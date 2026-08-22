import api from './api';

export const authService = {
  /**
   * Log in user with email and password
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    // Support response formats: { success, data: { user, token } } or { user, token }
    const responseData = response.data?.data || response.data;
    return responseData;
  },

  /**
   * Register a new user account
   * @param {Object} data - { name, email, password }
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    const responseData = response.data?.data || response.data;
    return responseData;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    const responseData = response.data?.data || response.data;
    // Support returning user object directly or nested { user }
    return responseData.user || responseData;
  },
};

export default authService;
