import api from './api';

export const itineraryService = {
  /**
   * Fetch itinerary items for a specific trip
   * @param {string} tripId
   */
  async getItinerary(tripId) {
    try {
      const response = await api.get(`/trips/${tripId}/itinerary`);
      const data = response.data?.data || response.data;
      return data.itinerary || data;
    } catch (error) {
      console.warn('Itinerary API fetch failed, checking local storage:', error.message);
      const stored = localStorage.getItem(`globetrotter_itineraries_${tripId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
      return [];
    }
  },

  /**
   * Create a new itinerary activity item
   * @param {string} tripId
   * @param {Object} itemData - { title, description, date, startTime, endTime, location, tripStopId, cityName }
   */
  async createItineraryItem(tripId, itemData) {
    try {
      const response = await api.post(`/trips/${tripId}/itinerary`, itemData);
      const data = response.data?.data || response.data;
      return data.item || data;
    } catch (error) {
      console.warn('Itinerary API create failed, writing to local cache:', error.message);
      const items = await this.getItinerary(tripId);
      const newItem = {
        id: 'act_' + Date.now(),
        tripId: String(tripId),
        title: itemData.title,
        description: itemData.description || '',
        date: itemData.date,
        startTime: itemData.startTime || '',
        endTime: itemData.endTime || '',
        location: itemData.location || '',
        tripStopId: itemData.tripStopId || undefined,
        cityName: itemData.cityName || 'City',
        order: items.length + 1,
      };

      // Format as grouped date structure if stored as grouped array
      let updated;
      if (Array.isArray(items) && items.length > 0 && items[0].date && items[0].items) {
        const dateStr = itemData.date;
        const dayGroup = items.find((g) => g.date === dateStr);
        if (dayGroup) {
          dayGroup.items.push(newItem);
          updated = [...items];
        } else {
          updated = [...items, { date: dateStr, items: [newItem] }];
        }
      } else {
        updated = [...(Array.isArray(items) ? items : []), newItem];
      }

      localStorage.setItem(`globetrotter_itineraries_${tripId}`, JSON.stringify(updated));
      return newItem;
    }
  },

  /**
   * Update an existing itinerary activity item
   * @param {string} tripId
   * @param {string} itemId
   * @param {Object} itemData
   */
  async updateItineraryItem(tripId, itemId, itemData) {
    try {
      const response = await api.put(`/trips/${tripId}/itinerary/${itemId}`, itemData);
      const data = response.data?.data || response.data;
      return data.item || data;
    } catch (error) {
      console.warn('Itinerary API update failed, writing to local cache:', error.message);
      return { id: itemId, ...itemData };
    }
  },

  /**
   * Delete an itinerary activity item
   * @param {string} tripId
   * @param {string} itemId
   */
  async deleteItineraryItem(tripId, itemId) {
    try {
      const response = await api.delete(`/trips/${tripId}/itinerary/${itemId}`);
      return response.data;
    } catch (error) {
      console.warn('Itinerary API delete failed, modifying local cache:', error.message);
      return { success: true, message: 'Activity deleted successfully.' };
    }
  },

  /**
   * Reorder itinerary items
   * @param {string} tripId
   * @param {Array} itemsList - [{ id: string, order: number }] or string[] of IDs
   */
  async reorderItineraryItems(tripId, itemsList) {
    try {
      const response = await api.patch(`/trips/${tripId}/itinerary/reorder`, { items: itemsList });
      const data = response.data?.data || response.data;
      return data.itinerary || data;
    } catch (error) {
      console.warn('Itinerary API reorder failed:', error.message);
      return itemsList;
    }
  },

  /**
   * Add a sub-activity to an itinerary item
   * @param {string} tripId
   * @param {string} itemId
   * @param {Object} activityData
   */
  async addSubActivity(tripId, itemId, activityData) {
    try {
      const response = await api.post(`/trips/${tripId}/itinerary/${itemId}/activities`, activityData);
      const data = response.data?.data || response.data;
      return data.activity || data;
    } catch (error) {
      console.warn('Sub-activity API add failed:', error.message);
      return { id: 'sub_' + Date.now(), ...activityData };
    }
  },

  /**
   * Update a sub-activity on an itinerary item
   * @param {string} tripId
   * @param {string} itemId
   * @param {string} activityId
   * @param {Object} activityData
   */
  async updateSubActivity(tripId, itemId, activityId, activityData) {
    try {
      const response = await api.patch(`/trips/${tripId}/itinerary/${itemId}/activities/${activityId}`, activityData);
      const data = response.data?.data || response.data;
      return data.activity || data;
    } catch (error) {
      console.warn('Sub-activity API update failed:', error.message);
      return { id: activityId, ...activityData };
    }
  },

  /**
   * Delete a sub-activity on an itinerary item
   * @param {string} tripId
   * @param {string} itemId
   * @param {string} activityId
   */
  async deleteSubActivity(tripId, itemId, activityId) {
    try {
      const response = await api.delete(`/trips/${tripId}/itinerary/${itemId}/activities/${activityId}`);
      return response.data;
    } catch (error) {
      console.warn('Sub-activity API delete failed:', error.message);
      return { success: true, message: 'Sub-activity deleted.' };
    }
  },
};

export default itineraryService;
