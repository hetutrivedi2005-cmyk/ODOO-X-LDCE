import api from './api';

const expenseService = {
  /**
   * Get all expenses for a trip.
   * @param {string} tripId
   */
  async getExpenses(tripId) {
    const response = await api.get(`/trips/${tripId}/expenses`);
    return response.data?.data?.expenses || [];
  },

  /**
   * Create a new expense.
   * @param {string} tripId
   * @param {Object} expenseData
   */
  async createExpense(tripId, expenseData) {
    const response = await api.post(`/trips/${tripId}/expenses`, expenseData);
    return response.data?.data?.expense;
  },

  /**
   * Update an existing expense.
   * @param {string} tripId
   * @param {string} expenseId
   * @param {Object} expenseData
   */
  async updateExpense(tripId, expenseId, expenseData) {
    const response = await api.patch(`/trips/${tripId}/expenses/${expenseId}`, expenseData);
    return response.data?.data?.expense;
  },

  /**
   * Delete an expense.
   * @param {string} tripId
   * @param {string} expenseId
   */
  async deleteExpense(tripId, expenseId) {
    const response = await api.delete(`/trips/${tripId}/expenses/${expenseId}`);
    return response.data;
  },

  /**
   * Get budget summary for a trip.
   * @param {string} tripId
   */
  async getExpensesSummary(tripId) {
    const response = await api.get(`/trips/${tripId}/expenses/summary`);
    return response.data?.data;
  },
};

export default expenseService;
