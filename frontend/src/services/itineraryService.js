import api from './api';

// Initial local storage fallback itinerary dataset
const DEFAULT_ITINERARIES = {
  '1': [
    {
      id: 'act_1',
      tripId: '1',
      title: 'Visit Eiffel Tower & Trocadéro',
      description: 'Morning sightseeing, photograph taking, and summit access.',
      date: '2026-10-12',
      startTime: '09:00',
      endTime: '11:30',
      location: 'Eiffel Tower, Champ de Mars',
      cityName: 'Paris',
      order: 1,
    },
    {
      id: 'act_2',
      tripId: '1',
      title: 'Lunch at Bistro Paul Bert',
      description: 'Traditional French cuisine and wine tasting.',
      date: '2026-10-12',
      startTime: '13:00',
      endTime: '14:30',
      location: '18 Rue Paul Bert, Paris',
      cityName: 'Paris',
      order: 2,
    },
    {
      id: 'act_3',
      tripId: '1',
      title: 'Louvre Museum Tour',
      description: 'Explore Mona Lisa, Venus de Milo, and Winged Victory.',
      date: '2026-10-12',
      startTime: '16:00',
      endTime: '19:00',
      location: 'Musée du Louvre, Rue de Rivoli',
      cityName: 'Paris',
      order: 3,
    },
    {
      id: 'act_4',
      tripId: '1',
      title: 'Notre-Dame & Sainte-Chapelle',
      description: 'Marvel at Gothic architecture and stained glass windows.',
      date: '2026-10-13',
      startTime: '10:00',
      endTime: '12:30',
      location: 'Île de la Cité, Paris',
      cityName: 'Paris',
      order: 1,
    },
    {
      id: 'act_5',
      tripId: '1',
      title: 'Sunset Seine River Cruise',
      description: 'Relaxing evening cruise passing illuminated landmarks.',
      date: '2026-10-13',
      startTime: '18:30',
      endTime: '20:00',
      location: 'Bateaux-Mouches, Port de la Conférence',
      cityName: 'Paris',
      order: 2,
    },
  ],
};

const getLocalItineraries = () => {
  const stored = localStorage.getItem('globetrotter_itineraries');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_ITINERARIES;
    }
  }
  localStorage.setItem('globetrotter_itineraries', JSON.stringify(DEFAULT_ITINERARIES));
  return DEFAULT_ITINERARIES;
};

const setLocalItineraries = (data) => {
  localStorage.setItem('globetrotter_itineraries', JSON.stringify(data));
};

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
      if (error.status === 404 || !error.status) {
        const localData = getLocalItineraries();
        return localData[tripId] || [];
      }
      throw error;
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
      if (error.status === 404 || !error.status) {
        const localData = getLocalItineraries();
        const tripItems = localData[tripId] || [];
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
          order: tripItems.length + 1,
        };

        localData[tripId] = [...tripItems, newItem];
        setLocalItineraries(localData);
        return newItem;
      }
      throw error;
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
      if (error.status === 404 || !error.status) {
        const localData = getLocalItineraries();
        const tripItems = localData[tripId] || [];
        const index = tripItems.findIndex((i) => String(i.id) === String(itemId));

        if (index === -1) {
          const err = new Error('Itinerary activity not found.');
          err.status = 404;
          throw err;
        }

        const updated = { ...tripItems[index], ...itemData };
        tripItems[index] = updated;
        localData[tripId] = tripItems;
        setLocalItineraries(localData);
        return updated;
      }
      throw error;
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
      if (error.status === 404 || !error.status) {
        const localData = getLocalItineraries();
        const tripItems = localData[tripId] || [];
        localData[tripId] = tripItems.filter((i) => String(i.id) !== String(itemId));
        setLocalItineraries(localData);
        return { success: true, message: 'Activity deleted successfully.' };
      }
      throw error;
    }
  },
};

export default itineraryService;
