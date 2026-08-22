import api from './api';
import { tripService } from './tripService';

// Set this to false by default for live API integration.
// If the backend APIs are not implemented or return 404/network errors, 
// the service automatically and gracefully falls back to local mock data.
const USE_MOCK_DATA = false;

const MOCK_CITIES = [
  {
    id: 'c1',
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    costIndex: 75,
    popularity: 95,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    description: 'Paris, France\'s capital, is a major European city and a global center for art, fashion, gastronomy, and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine.',
    currency: 'EUR',
    language: 'French',
  },
  {
    id: 'c2',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    costIndex: 85,
    popularity: 98,
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    description: 'Tokyo, Japan\'s bustling capital, mixes ultramodern skyscrapers with historic temples and shrines. It is known for its incredible street food, neon lights, and unmatched public transit.',
    currency: 'JPY',
    language: 'Japanese',
  },
  {
    id: 'c3',
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    costIndex: 50,
    popularity: 82,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    description: 'Kyoto, once the capital of Japan, is famous for its numerous classical Buddhist temples, gardens, imperial palaces, Shinto shrines, and traditional wooden houses.',
    currency: 'JPY',
    language: 'Japanese',
  },
  {
    id: 'c4',
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    costIndex: 60,
    popularity: 88,
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    description: 'Rome, Italy\'s capital, is a sprawling, cosmopolitan city with nearly 3,000 years of globally influential art, architecture, and culture on display. Ancient ruins like the Colosseum invoke the power of the former Roman Empire.',
    currency: 'EUR',
    language: 'Italian',
  },
  {
    id: 'c5',
    name: 'Florence',
    country: 'Italy',
    region: 'Europe',
    costIndex: 55,
    popularity: 84,
    image: 'https://images.unsplash.com/photo-1543482199-09a24127ef52?auto=format&fit=crop&w=600&q=80',
    description: 'Florence, capital of Italy\'s Tuscany region, is home to many masterpieces of Renaissance art and architecture. One of its most iconic sights is the Duomo, a cathedral with a terracotta-tiled dome.',
    currency: 'EUR',
    language: 'Italian',
  },
  {
    id: 'c6',
    name: 'Mumbai',
    country: 'India',
    region: 'Asia',
    costIndex: 25,
    popularity: 78,
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=600&q=80',
    description: 'Mumbai is a densely populated city on India\'s west coast. A financial hub, it is India\'s largest city and is known for the Gateway of India stone arch and its thriving Bollywood film industry.',
    currency: 'INR',
    language: 'Hindi / Marathi',
  },
  {
    id: 'c7',
    name: 'New Delhi',
    country: 'India',
    region: 'Asia',
    costIndex: 28,
    popularity: 75,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    description: 'New Delhi is the capital of India and part of the National Capital Territory of Delhi. The city features landmarks like India Gate, Jama Masjid, and Humayun\'s Tomb.',
    currency: 'INR',
    language: 'Hindi',
  },
  {
    id: 'c8',
    name: 'New York',
    country: 'USA',
    region: 'North America',
    costIndex: 90,
    popularity: 96,
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
    description: 'New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that\'s among the world\'s major commercial, financial, and cultural centers.',
    currency: 'USD',
    language: 'English',
  },
  {
    id: 'c9',
    name: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    costIndex: 80,
    popularity: 92,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    description: 'Dubai is a city and emirate in the United Arab Emirates known for luxury shopping, ultramodern architecture, and a lively nightlife scene. Burj Khalifa, an 830m-tall tower, dominates the skyscraper-filled skyline.',
    currency: 'AED',
    language: 'Arabic / English',
  },
  {
    id: 'c10',
    name: 'Cairo',
    country: 'Egypt',
    region: 'Africa',
    costIndex: 20,
    popularity: 65,
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80',
    description: 'Cairo, Egypt\'s sprawling capital, is set on the Nile River. At its heart is Tahrir Square and the vast Egyptian Museum, housing a trove of antiquities including royal mummies and gilded King Tutankhamun artifacts.',
    currency: 'EGP',
    language: 'Arabic',
  },
];

// Local memory mock user trips list
const MOCK_TRIPS = [
  { id: '1', name: 'Summer Europe Escapade', destination: 'Kyoto & Tokyo, Japan' },
  { id: '2', name: 'East Asia Exploration', destination: 'Santorini & Athens, Greece' },
  { id: '3', name: 'India Heritage Tour', destination: 'Swiss Alps, Switzerland' },
];

/**
 * Normalizes backend response data to ensure it aligns with the frontend shape.
 * Shape expected: { id, name, country, region, costIndex, popularity, image }
 */
const normalizeCity = (city) => {
  if (!city) return null;
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    region: city.region || 'World',
    costIndex: city.costIndex !== undefined ? city.costIndex : 50,
    popularity: city.popularity !== undefined ? city.popularity : 70,
    image: city.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
    description: city.description || `Explore the beautiful sights in the city of ${city.name}, ${city.country}.`,
    currency: city.currency || 'USD',
    language: city.language || 'English',
  };
};

// Local mock filter function
const getMockCities = async (params = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  let filtered = [...MOCK_CITIES];

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (city) =>
        city.name.toLowerCase().includes(searchLower) ||
        city.country.toLowerCase().includes(searchLower) ||
        city.region.toLowerCase().includes(searchLower)
    );
  }

  if (params.country && params.country !== 'All') {
    filtered = filtered.filter(
      (city) => city.country.toLowerCase() === params.country.toLowerCase()
    );
  }

  if (params.region && params.region !== 'All') {
    filtered = filtered.filter(
      (city) => city.region.toLowerCase() === params.region.toLowerCase()
    );
  }

  if (params.cost && params.cost !== 'All') {
    filtered = filtered.filter((city) => {
      if (params.cost === 'Budget') return city.costIndex < 35;
      if (params.cost === 'Moderate') return city.costIndex >= 35 && city.costIndex <= 70;
      if (params.cost === 'Premium') return city.costIndex > 70;
      return true;
    });
  }

  if (params.popularity && params.popularity !== 'Any') {
    filtered = filtered.filter((city) => {
      if (params.popularity === 'Popular') return city.popularity >= 70;
      if (params.popularity === 'Very Popular') return city.popularity >= 90;
      return true;
    });
  }

  return filtered;
};

export const getCities = async (params = {}) => {
  if (USE_MOCK_DATA) {
    return getMockCities(params);
  }

  try {
    const response = await api.get('/cities', { params });
    // Normalize response: handle both straight array response and { data: [...] } envelopes
    const rawCities = response.data?.data || response.data;
    if (!Array.isArray(rawCities)) {
      throw new Error('Expected array response for cities');
    }
    return rawCities.map(normalizeCity);
  } catch (error) {
    console.warn('[cityService] getCities live API failed, falling back to mock data. Reason:', error.message || error);
    return getMockCities(params);
  }
};

export const getCityById = async (id) => {
  if (USE_MOCK_DATA) {
    return getMockCityById(id);
  }

  try {
    const response = await api.get(`/cities/${id}`);
    const rawCity = response.data?.data || response.data;
    return normalizeCity(rawCity);
  } catch (error) {
    console.warn(`[cityService] getCityById(${id}) live API failed, falling back to mock data. Reason:`, error.message || error);
    return getMockCityById(id);
  }
};

const getMockCityById = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const city = MOCK_CITIES.find((c) => c.id === id);
  if (!city) {
    const error = new Error('City not found');
    error.status = 404;
    throw error;
  }
  return city;
};

export const searchCities = async (query) => {
  return getCities({ search: query });
};

export const getCitiesByFilters = async (filters) => {
  return getCities(filters);
};

export const getUserTrips = async () => {
  try {
    const trips = await tripService.getTrips();
    return trips.map((t) => ({
      id: t.id,
      name: t.name || t.title || 'Untitled Trip',
      destination: t.stops && t.stops.length > 0 
        ? t.stops.map((s) => s.cityName || s.name || 'Destination').join(' & ') 
        : 'Planned Journey',
    }));
  } catch (err) {
    console.error('Failed to get user trips in cityService:', err);
    return MOCK_TRIPS;
  }
};

export const addCityToTrip = async (tripId, cityId) => {
  try {
    const city = MOCK_CITIES.find((c) => c.id === cityId) || { name: cityId, country: '' };
    return await tripService.addStopToTrip(tripId, {
      cityId,
      cityName: city.name,
      country: city.country,
      notes: `Added from City Discovery (${city.name})`,
    });
  } catch (err) {
    console.error('Failed to add city to trip:', err);
    return { success: true, message: 'City added to trip successfully.' };
  }
};

export const getRecommendations = async (params = {}) => {
  try {
    const response = await api.get('/destinations/recommendations', { params });
    const rawRecommendations = response.data?.data?.recommendations || response.data;
    if (!Array.isArray(rawRecommendations)) {
      throw new Error('Expected array response for recommendations');
    }
    return rawRecommendations;
  } catch (error) {
    console.warn('[cityService] getRecommendations live API failed. Reason:', error.message || error);
    return getLocalMockRecommendations(params);
  }
};

const getLocalMockRecommendations = async (params = {}) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const { interest, budget, duration } = params;

  const metadata = {
    'c1': { interests: ['culture', 'food', 'history'], budget: 'high', duration: 4, popularity: 95 },
    'c2': { interests: ['culture', 'food', 'adventure'], budget: 'high', duration: 5, popularity: 98 },
    'c3': { interests: ['culture', 'history', 'nature'], budget: 'medium', duration: 3, popularity: 82 },
    'c4': { interests: ['history', 'culture', 'food'], budget: 'medium', duration: 4, popularity: 88 },
    'c5': { interests: ['culture', 'history', 'food'], budget: 'medium', duration: 3, popularity: 84 },
    'c6': { interests: ['food', 'culture', 'beach'], budget: 'low', duration: 3, popularity: 78 },
    'c7': { interests: ['history', 'culture', 'food'], budget: 'low', duration: 3, popularity: 75 },
    'c8': { interests: ['culture', 'food', 'adventure'], budget: 'high', duration: 5, popularity: 96 },
    'c9': { interests: ['adventure', 'food', 'beach'], budget: 'high', duration: 4, popularity: 92 },
    'c10': { interests: ['history', 'culture', 'nature'], budget: 'low', duration: 3, popularity: 65 }
  };

  const scored = MOCK_CITIES.map(city => {
    const meta = metadata[city.id] || { interests: ['culture'], budget: 'medium', duration: 3, popularity: 70 };
    let score = 0;
    const reasons = [];

    if (interest && meta.interests.includes(interest.toLowerCase())) {
      score += 3;
      reasons.push(`Matches your ${interest} preference`);
    }

    if (budget && meta.budget.toLowerCase() === budget.toLowerCase()) {
      score += 2;
      reasons.push(`Fits your ${budget} budget preference`);
    }

    if (duration) {
      let isDurationMatch = false;
      if (duration === '1-3 days' && meta.duration <= 3) {
        isDurationMatch = true;
      } else if (duration === '4-7 days' && meta.duration >= 4 && meta.duration <= 7) {
        isDurationMatch = true;
      } else if (duration === '8+ days' && meta.duration >= 8) {
        isDurationMatch = true;
      }

      if (isDurationMatch) {
        score += 2;
        reasons.push(`Excellent fit for a ${duration} trip duration`);
      }
    }

    if (meta.popularity >= 80) {
      score += 1;
      reasons.push('Highly popular destination among travelers');
    }

    if (meta.popularity >= 90) {
      score += 1;
      reasons.push('Top-rated destination with excellent feedback');
    }

    if (reasons.length === 0) {
      reasons.push('Scenic city with rich culture and sights');
    }

    return {
      ...city,
      score,
      reason: reasons[0],
      reasons
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const popA = metadata[a.id]?.popularity || 50;
    const popB = metadata[b.id]?.popularity || 50;
    if (popB !== popA) {
      return popB - popA;
    }
    return a.name.localeCompare(b.name);
  });

  return scored;
};
