import api from './api';

// Initial local storage fallback trips dataset
const DEFAULT_TRIPS = [
  {
    id: '1',
    name: 'Europe Adventure',
    description: 'Exploring historic cities, local cuisine, and architectural wonders across Japan.',
    startDate: '2026-10-12',
    endDate: '2026-10-22',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    stops: [
      {
        id: 's1',
        cityName: 'Tokyo',
        country: 'Japan',
        startDate: '2026-10-12',
        endDate: '2026-10-16',
        notes: 'Visit Shibuya Crossing, Senso-ji Temple, and Akihabara.',
      },
      {
        id: 's2',
        cityName: 'Kyoto',
        country: 'Japan',
        startDate: '2026-10-16',
        endDate: '2026-10-22',
        notes: 'Fushimi Inari Shrine and Arashiyama Bamboo Grove.',
      },
    ],
  },
  {
    id: '2',
    name: 'Mediterranean Summer',
    description: 'Relaxing beach vacation, island hopping, and ancient historical sites.',
    startDate: '2026-06-14',
    endDate: '2026-06-21',
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    stops: [
      {
        id: 's3',
        cityName: 'Santorini',
        country: 'Greece',
        startDate: '2026-06-14',
        endDate: '2026-06-18',
        notes: 'Sunset in Oia and Red Beach exploration.',
      },
      {
        id: 's4',
        cityName: 'Athens',
        country: 'Greece',
        startDate: '2026-06-18',
        endDate: '2026-06-21',
        notes: 'Acropolis and Parthenon tour.',
      },
    ],
  },
];

// Helper to access local storage trips cache
const getLocalTrips = () => {
  const stored = localStorage.getItem('globetrotter_trips');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_TRIPS;
    }
  }
  localStorage.setItem('globetrotter_trips', JSON.stringify(DEFAULT_TRIPS));
  return DEFAULT_TRIPS;
};

const setLocalTrips = (trips) => {
  localStorage.setItem('globetrotter_trips', JSON.stringify(trips));
};

export const tripService = {
  /**
   * Fetch all trips for the authenticated user
   */
  async getTrips() {
    try {
      const response = await api.get('/trips');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : data.trips || [];
    } catch (error) {
      if (error.status === 404 || !error.status) {
        // Fallback to local storage cache if backend endpoint not active yet
        return getLocalTrips();
      }
      throw error;
    }
  },

  /**
   * Fetch a single trip by ID with stops and city info
   * @param {string} id
   */
  async getTripById(id) {
    try {
      const response = await api.get(`/trips/${id}`);
      const data = response.data?.data || response.data;
      return data.trip || data;
    } catch (error) {
      if (error.status === 404 || !error.status) {
        const localTrips = getLocalTrips();
        const trip = localTrips.find((t) => String(t.id) === String(id));
        if (!trip) {
          const err = new Error('Trip not found.');
          err.status = 404;
          throw err;
        }
        return trip;
      }
      throw error;
    }
  },

  /**
   * Create a new trip
   * @param {Object} tripData - { name, description, startDate, endDate, coverImage }
   */
  async createTrip(tripData) {
    try {
      const response = await api.post('/trips', tripData);
      const data = response.data?.data || response.data;
      return data.trip || data;
    } catch (error) {
      if (error.status === 404 || !error.status) {
        const localTrips = getLocalTrips();
        const newTrip = {
          id: String(Date.now()),
          name: tripData.name,
          description: tripData.description || '',
          startDate: tripData.startDate,
          endDate: tripData.endDate,
          coverImage: tripData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
          stops: [],
        };
        const updated = [newTrip, ...localTrips];
        setLocalTrips(updated);
        return newTrip;
      }
      throw error;
    }
  },

  /**
   * Update an existing trip
   * @param {string} id
   * @param {Object} tripData
   */
  async updateTrip(id, tripData) {
    try {
      const response = await api.put(`/trips/${id}`, tripData);
      const data = response.data?.data || response.data;
      return data.trip || data;
    } catch (error) {
      if (error.status === 404 || !error.status) {
        const localTrips = getLocalTrips();
        const index = localTrips.findIndex((t) => String(t.id) === String(id));
        if (index === -1) {
          const err = new Error('Trip not found for update.');
          err.status = 404;
          throw err;
        }
        const updatedTrip = { ...localTrips[index], ...tripData };
        localTrips[index] = updatedTrip;
        setLocalTrips(localTrips);
        return updatedTrip;
      }
      throw error;
    }
  },

  /**
   * Delete a trip
   * @param {string} id
   */
  async deleteTrip(id) {
    try {
      const response = await api.delete(`/trips/${id}`);
      return response.data;
    } catch (error) {
      if (error.status === 404 || !error.status) {
        const localTrips = getLocalTrips();
        const filtered = localTrips.filter((t) => String(t.id) !== String(id));
        setLocalTrips(filtered);
        return { success: true, message: 'Trip deleted successfully.' };
      }
      throw error;
    }
  },

  /**
   * Add a destination stop to a trip
   * @param {string} tripId
   * @param {Object} stopData - { cityId, cityName, country, startDate, endDate, notes }
   */
  async addStopToTrip(tripId, stopData) {
    try {
      const response = await api.post(`/trips/${tripId}/stops`, stopData);
      const data = response.data?.data || response.data;
      return data.stop || data;
    } catch (error) {
      if (error.status === 404 || !error.status) {
        const localTrips = getLocalTrips();
        const trip = localTrips.find((t) => String(t.id) === String(tripId));
        if (trip) {
          const newStop = {
            id: 's_' + Date.now(),
            cityName: stopData.cityName || stopData.name || 'New City',
            country: stopData.country || 'Destination',
            startDate: stopData.startDate || trip.startDate,
            endDate: stopData.endDate || trip.endDate,
            notes: stopData.notes || '',
          };
          trip.stops = trip.stops || [];
          trip.stops.push(newStop);
          setLocalTrips(localTrips);
          return newStop;
        }
      }
      throw error;
    }
  },
};

export default tripService;
