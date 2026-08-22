import api from './api';

// Set this to false to connect directly to Person 1's backend City API (/api/cities)
const USE_MOCK_DATA = true;

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
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5a0af?auto=format&fit=crop&w=600&q=80',
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

export const getCities = async (params = {}) => {
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    let filtered = [...MOCK_CITIES];

    // Search query matches city name, country, or region (case-insensitive)
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (city) =>
          city.name.toLowerCase().includes(searchLower) ||
          city.country.toLowerCase().includes(searchLower) ||
          city.region.toLowerCase().includes(searchLower)
      );
    }

    // Filter by Country
    if (params.country && params.country !== 'All') {
      filtered = filtered.filter(
        (city) => city.country.toLowerCase() === params.country.toLowerCase()
      );
    }

    // Filter by Region
    if (params.region && params.region !== 'All') {
      filtered = filtered.filter(
        (city) => city.region.toLowerCase() === params.region.toLowerCase()
      );
    }

    // Filter by Cost Level: Budget (<35), Moderate (35-70), Premium (>70)
    if (params.cost && params.cost !== 'All') {
      filtered = filtered.filter((city) => {
        if (params.cost === 'Budget') return city.costIndex < 35;
        if (params.cost === 'Moderate') return city.costIndex >= 35 && city.costIndex <= 70;
        if (params.cost === 'Premium') return city.costIndex > 70;
        return true;
      });
    }

    // Filter by Popularity: Any, Popular (>=70), Very Popular (>=90)
    if (params.popularity && params.popularity !== 'Any') {
      filtered = filtered.filter((city) => {
        if (params.popularity === 'Popular') return city.popularity >= 70;
        if (params.popularity === 'Very Popular') return city.popularity >= 90;
        return true;
      });
    }

    return filtered;
  } else {
    const response = await api.get('/cities', { params });
    return response.data;
  }
};

export const getCityById = async (id) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const city = MOCK_CITIES.find((c) => c.id === id);
    if (!city) {
      const error = new Error('City not found');
      error.status = 404;
      throw error;
    }
    return city;
  } else {
    const response = await api.get(`/cities/${id}`);
    return response.data;
  }
};

export const searchCities = async (query) => {
  return getCities({ search: query });
};

export const getCitiesByFilters = async (filters) => {
  return getCities(filters);
};

export const getUserTrips = async () => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_TRIPS;
  } else {
    const response = await api.get('/trips');
    return response.data;
  }
};

export const addCityToTrip = async (tripId, cityId) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    console.log(`[Mock API] Added city ID: ${cityId} to trip ID: ${tripId}`);
    return { success: true, message: 'City added to trip successfully.' };
  } else {
    const response = await api.post(`/trips/${tripId}/stops`, { cityId });
    return response.data;
  }
};
