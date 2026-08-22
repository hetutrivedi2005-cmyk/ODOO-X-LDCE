import api from './api';

export const shareService = {
  /**
   * Generates a public share link for a trip.
   * @param {string} tripId
   * @param {Object} data - { expiresAt: Date/String }
   */
  async createShareLink(tripId, data) {
    const response = await api.post(`/trips/${tripId}/share`, data);
    return response.data?.data?.share || response.data;
  },

  /**
   * Fetches all share links associated with a trip.
   * @param {string} tripId
   */
  async getShareLinks(tripId) {
    const response = await api.get(`/trips/${tripId}/shares`);
    return response.data?.data?.shares || response.data;
  },

  /**
   * Revokes a specific share link.
   * @param {string} tripId
   * @param {string} shareId
   */
  async revokeShareLink(tripId, shareId) {
    const response = await api.delete(`/trips/${tripId}/share/${shareId}`);
    return response.data;
  },

  /**
   * Fetches a shared trip's read-only details publicly.
   * Does NOT require user login credentials.
   * @param {string} shareToken
   */
  async getSharedTrip(shareToken) {
    const response = await api.get(`/shared/${shareToken}`);
    return response.data?.data?.trip || response.data;
  }
};

export default shareService;
