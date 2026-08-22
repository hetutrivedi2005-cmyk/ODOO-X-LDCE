const prisma = require('../config/prisma');

const STATIC_CITY_METADATA = {
  'c1': {
    region: 'Europe',
    interests: ['culture', 'food', 'history'],
    budget: 'high',
    duration: 4, // 4-7 days
    costIndex: 75,
    popularity: 95,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    description: 'Paris, France\'s capital, is a major European city and a global center for art, fashion, gastronomy, and culture.',
    currency: 'EUR',
    language: 'French'
  },
  'c2': {
    region: 'Asia',
    interests: ['culture', 'food', 'adventure'],
    budget: 'high',
    duration: 5, // 4-7 days
    costIndex: 85,
    popularity: 98,
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    description: 'Tokyo, Japan\'s bustling capital, mixes ultramodern skyscrapers with historic temples and shrines.',
    currency: 'JPY',
    language: 'Japanese'
  },
  'c3': {
    region: 'Asia',
    interests: ['culture', 'history', 'nature'],
    budget: 'medium',
    duration: 3, // 1-3 days
    costIndex: 50,
    popularity: 82,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    description: 'Kyoto, once the capital of Japan, is famous for its numerous classical Buddhist temples, gardens, and shrines.',
    currency: 'JPY',
    language: 'Japanese'
  },
  'c4': {
    region: 'Europe',
    interests: ['history', 'culture', 'food'],
    budget: 'medium',
    duration: 4, // 4-7 days
    costIndex: 60,
    popularity: 88,
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    description: 'Rome, Italy\'s capital, is a sprawling, cosmopolitan city with nearly 3,000 years of globally influential art and culture.',
    currency: 'EUR',
    language: 'Italian'
  },
  'c5': {
    region: 'Europe',
    interests: ['culture', 'history', 'food'],
    budget: 'medium',
    duration: 3, // 1-3 days
    costIndex: 55,
    popularity: 84,
    image: 'https://images.unsplash.com/photo-1543482199-09a24127ef52?auto=format&fit=crop&w=600&q=80',
    description: 'Florence, capital of Italy\'s Tuscany region, is home to many masterpieces of Renaissance art and architecture.',
    currency: 'EUR',
    language: 'Italian'
  },
  'c6': {
    region: 'Asia',
    interests: ['food', 'culture', 'beach'],
    budget: 'low',
    duration: 3, // 1-3 days
    costIndex: 25,
    popularity: 78,
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=600&q=80',
    description: 'Mumbai is a densely populated city on India\'s west coast. A financial hub, it is India\'s largest city.',
    currency: 'INR',
    language: 'Hindi / Marathi'
  },
  'c7': {
    region: 'Asia',
    interests: ['history', 'culture', 'food'],
    budget: 'low',
    duration: 3, // 1-3 days
    costIndex: 28,
    popularity: 75,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    description: 'New Delhi is the capital of India and part of the National Capital Territory of Delhi.',
    currency: 'INR',
    language: 'Hindi'
  },
  'c8': {
    region: 'North America',
    interests: ['culture', 'food', 'adventure'],
    budget: 'high',
    duration: 5, // 4-7 days
    costIndex: 90,
    popularity: 96,
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80',
    description: 'New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean.',
    currency: 'USD',
    language: 'English'
  },
  'c9': {
    region: 'Middle East',
    interests: ['adventure', 'food', 'beach'],
    budget: 'high',
    duration: 4, // 4-7 days
    costIndex: 80,
    popularity: 92,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    description: 'Dubai is a city and emirate in the United Arab Emirates known for luxury shopping and ultramodern architecture.',
    currency: 'AED',
    language: 'Arabic / English'
  },
  'c10': {
    region: 'Africa',
    interests: ['history', 'culture', 'nature'],
    budget: 'low',
    duration: 3, // 1-3 days
    costIndex: 20,
    popularity: 65,
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80',
    description: 'Cairo, Egypt\'s sprawling capital, is set on the Nile River. At its heart is Tahrir Square.',
    currency: 'EGP',
    language: 'Arabic'
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const { interest, budget, duration } = req.query;

    // Fetch cities from the database
    let dbCities = [];
    try {
      dbCities = await prisma.city.findMany();
    } catch (dbErr) {
      console.warn('[Recommendations] Failed to query cities from database:', dbErr.message);
    }

    // Map database cities or fall back to static city metadata list if empty
    let sourceCities = [];
    if (dbCities.length > 0) {
      sourceCities = dbCities.map(city => {
        // Find matching metadata or use default template
        const nameMap = {
          'c1': 'Paris', 'c2': 'Tokyo', 'c3': 'Kyoto', 'c4': 'Rome', 'c5': 'Florence',
          'c6': 'Mumbai', 'c7': 'New Delhi', 'c8': 'New York', 'c9': 'Dubai', 'c10': 'Cairo'
        };
        const metaKey = Object.keys(nameMap).find(
          key => nameMap[key].toLowerCase() === city.name?.toLowerCase()
        );
        const meta = STATIC_CITY_METADATA[metaKey] || {
          region: 'World',
          interests: ['culture'],
          budget: 'medium',
          duration: 3,
          costIndex: 50,
          popularity: 70,
          image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
          description: `Explore the beautiful sights in the city of ${city.name}, ${city.country}.`
        };
        return {
          id: city.id,
          name: city.name,
          country: city.country,
          ...meta
        };
      });
    } else {
      // Direct static array representation fallback for testing/empty DB
      sourceCities = Object.entries(STATIC_CITY_METADATA).map(([id, meta]) => {
        const nameMap = {
          'c1': 'Paris', 'c2': 'Tokyo', 'c3': 'Kyoto', 'c4': 'Rome', 'c5': 'Florence',
          'c6': 'Mumbai', 'c7': 'New Delhi', 'c8': 'New York', 'c9': 'Dubai', 'c10': 'Cairo'
        };
        const countryMap = {
          'c1': 'France', 'c2': 'Japan', 'c3': 'Japan', 'c4': 'Italy', 'c5': 'Italy',
          'c6': 'India', 'c7': 'India', 'c8': 'USA', 'c9': 'UAE', 'c10': 'Egypt'
        };
        return {
          id,
          name: nameMap[id],
          country: countryMap[id],
          ...meta
        };
      });
    }

    // Evaluate scoring
    const recommendations = sourceCities.map(city => {
      let score = 0;
      const reasons = [];

      // 1. Interest Match (+3 pts)
      if (interest && city.interests.includes(interest.toLowerCase())) {
        score += 3;
        reasons.push(`Matches your ${interest} preference`);
      }

      // 2. Budget Match (+2 pts)
      if (budget && city.budget.toLowerCase() === budget.toLowerCase()) {
        score += 2;
        reasons.push(`Fits your ${budget} budget preference`);
      }

      // 3. Duration suitability match (+2 pts)
      // Ranges: '1-3 days', '4-7 days', '8+ days'
      if (duration) {
        let isDurationMatch = false;
        if (duration === '1-3 days' && city.duration <= 3) {
          isDurationMatch = true;
        } else if (duration === '4-7 days' && city.duration >= 4 && city.duration <= 7) {
          isDurationMatch = true;
        } else if (duration === '8+ days' && city.duration >= 8) {
          isDurationMatch = true;
        }

        if (isDurationMatch) {
          score += 2;
          reasons.push(`Excellent fit for a ${duration} trip duration`);
        }
      }

      // 4. Popularity match (+1 pt)
      if (city.popularity >= 80) {
        score += 1;
        reasons.push('Highly popular destination among travelers');
      }

      // 5. Rating match (+1 pt)
      if (city.popularity >= 90) {
        score += 1;
        reasons.push('Top-rated destination with excellent feedback');
      }

      // If reasons is empty, supply a generic fallback reason
      if (reasons.length === 0) {
        reasons.push('Scenic city with rich culture and sights');
      }

      return {
        id: city.id,
        name: city.name,
        country: city.country,
        region: city.region,
        costIndex: city.costIndex,
        popularity: city.popularity,
        image: city.image,
        description: city.description,
        currency: city.currency,
        language: city.language,
        score,
        reason: reasons[0], // primary explanation
        reasons // full reasons list
      };
    });

    // Sort by score DESC, then popularity DESC, then name ASC
    recommendations.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.popularity !== a.popularity) {
        return b.popularity - a.popularity;
      }
      return a.name.localeCompare(b.name);
    });

    // Respond matching shape: { success: true, data: { recommendations: [...] } }
    return res.status(200).json({
      success: true,
      data: {
        recommendations
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations
};
