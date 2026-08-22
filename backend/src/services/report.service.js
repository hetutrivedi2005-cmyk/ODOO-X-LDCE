const prisma = require('../config/prisma');

/**
 * Build where clause for Trip queries.
 */
const buildTripWhere = (userId, filters = {}) => {
  const where = { userId };
  if (filters.tripId) {
    where.id = filters.tripId;
  }
  if (filters.startDate || filters.endDate) {
    where.AND = [];
    if (filters.startDate) {
      where.AND.push({
        endDate: { gte: new Date(filters.startDate) }
      });
    }
    if (filters.endDate) {
      where.AND.push({
        startDate: { lte: new Date(filters.endDate) }
      });
    }
  }
  return where;
};

/**
 * Build where clause for Expense queries.
 */
const buildExpenseWhere = (userId, filters = {}) => {
  const where = { trip: { userId } };
  if (filters.tripId) {
    where.tripId = filters.tripId;
  }
  if (filters.category && filters.category !== 'All') {
    where.category = filters.category;
  }
  if (filters.startDate || filters.endDate) {
    where.spentAt = {};
    if (filters.startDate) {
      where.spentAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.spentAt.lte = new Date(filters.endDate);
    }
  }
  return where;
};

/**
 * Build where clause for Stop / Destination queries.
 */
const buildStopWhere = (userId, filters = {}) => {
  const where = { trip: { userId } };
  if (filters.tripId) {
    where.tripId = filters.tripId;
  }
  if (filters.startDate || filters.endDate) {
    where.AND = [];
    if (filters.startDate) {
      where.AND.push({
        endDate: { gte: new Date(filters.startDate) }
      });
    }
    if (filters.endDate) {
      where.AND.push({
        startDate: { lte: new Date(filters.endDate) }
      });
    }
  }
  return where;
};

/**
 * Retrieves the overall KPIs and summary.
 */
const getOverview = async (userId, filters = {}) => {
  const tripWhere = buildTripWhere(userId, filters);
  const expenseWhere = buildExpenseWhere(userId, filters);
  const stopWhere = buildStopWhere(userId, filters);

  const now = new Date();

  // 1. Fetch user trips
  const trips = await prisma.trip.findMany({
    where: tripWhere,
    select: {
      startDate: true,
      endDate: true
    }
  });

  const totalTrips = trips.length;
  let activeTrips = 0;
  let completedTrips = 0;
  let upcomingTrips = 0;
  let totalTravelDays = 0;

  trips.forEach(trip => {
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      
      // Calculate status
      if (now >= start && now <= end) {
        activeTrips++;
      } else if (now > end) {
        completedTrips++;
      } else if (now < start) {
        upcomingTrips++;
      }

      // Add travel days
      const diff = end.getTime() - start.getTime();
      totalTravelDays += Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }
  });

  // 2. Fetch total unique destinations
  const stops = await prisma.tripStop.findMany({
    where: stopWhere,
    select: {
      cityId: true
    }
  });
  const uniqueCities = new Set(stops.map(s => s.cityId));
  const totalDestinations = uniqueCities.size;

  // 3. Fetch expenses grouped by currency
  const expenses = await prisma.expense.groupBy({
    by: ['currency'],
    where: expenseWhere,
    _sum: {
      amount: true
    }
  });

  const totalSpendingByCurrency = expenses.map(e => ({
    currency: e.currency,
    amount: e._sum.amount || 0
  }));

  return {
    totalTrips,
    activeTrips,
    completedTrips,
    upcomingTrips,
    totalDestinations,
    totalTravelDays,
    totalSpendingByCurrency
  };
};

/**
 * Retrieves spending analytics (category split, averages, currency-aware values).
 */
const getExpenseAnalytics = async (userId, filters = {}) => {
  const expenseWhere = buildExpenseWhere(userId, filters);

  // 1. Raw expenses
  const expenses = await prisma.expense.findMany({
    where: expenseWhere,
    include: {
      trip: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      spentAt: 'asc'
    }
  });

  // Group by category, trip, and currency
  const byCategory = {};
  const byTrip = {};
  const byCurrency = {};
  let totalUSDSpending = 0; // Simple fallback sum if conversions are needed, else display raw currency arrays

  expenses.forEach(exp => {
    const { amount, currency, category, trip } = exp;
    const tripName = trip?.name || 'Unknown Trip';

    // Currency totals
    if (!byCurrency[currency]) {
      byCurrency[currency] = { total: 0, count: 0, avg: 0 };
    }
    byCurrency[currency].total += amount;
    byCurrency[currency].count++;

    // Category breakdown (currency-specific)
    if (!byCategory[category]) {
      byCategory[category] = {};
    }
    if (!byCategory[category][currency]) {
      byCategory[category][currency] = 0;
    }
    byCategory[category][currency] += amount;

    // Trip breakdown (currency-specific)
    if (!byTrip[tripName]) {
      byTrip[tripName] = {};
    }
    if (!byTrip[tripName][currency]) {
      byTrip[tripName][currency] = 0;
    }
    byTrip[tripName][currency] += amount;
  });

  // Calculate averages per currency
  Object.keys(byCurrency).forEach(curr => {
    byCurrency[curr].avg = byCurrency[curr].total / byCurrency[curr].count;
  });

  // Category array formatted for frontend
  const categoriesList = Object.keys(byCategory).map(catName => ({
    category: catName,
    breakdown: Object.keys(byCategory[catName]).map(curr => ({
      currency: curr,
      amount: byCategory[catName][curr]
    }))
  }));

  // Trip array formatted for frontend
  const tripsList = Object.keys(byTrip).map(tName => ({
    tripName: tName,
    breakdown: Object.keys(byTrip[tName]).map(curr => ({
      currency: curr,
      amount: byTrip[tName][curr]
    }))
  }));

  // Spending over time (monthly or daily grouping depending on date range)
  let useDaily = false;
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    const end = filters.endDate ? new Date(filters.endDate) : new Date();
    const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
    if (diffDays <= 45) {
      useDaily = true;
    }
  } else if (expenses.length > 0) {
    const dates = expenses.map(e => new Date(e.spentAt).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const diffDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 45) {
      useDaily = true;
    }
  }

  const overTimeMap = {};
  expenses.forEach(exp => {
    if (exp.spentAt) {
      const date = new Date(exp.spentAt);
      const periodKey = useDaily
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      if (!overTimeMap[periodKey]) {
        overTimeMap[periodKey] = {};
      }
      if (!overTimeMap[periodKey][exp.currency]) {
        overTimeMap[periodKey][exp.currency] = 0;
      }
      overTimeMap[periodKey][exp.currency] += exp.amount;
    }
  });

  const overTimeList = Object.keys(overTimeMap).map(pKey => ({
    period: pKey,
    breakdown: Object.keys(overTimeMap[pKey]).map(curr => ({
      currency: curr,
      amount: overTimeMap[pKey][curr]
    }))
  }));

  return {
    currencies: Object.keys(byCurrency).map(curr => ({
      currency: curr,
      total: byCurrency[curr].total,
      avg: byCurrency[curr].avg,
      count: byCurrency[curr].count
    })),
    byCategory: categoriesList,
    byTrip: tripsList,
    overTime: overTimeList
  };
};

/**
 * Retrieves detailed trip lists and distribution statuses.
 */
const getTripAnalytics = async (userId, filters = {}) => {
  const tripWhere = buildTripWhere(userId, filters);
  const now = new Date();

  const trips = await prisma.trip.findMany({
    where: tripWhere,
    include: {
      stops: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  const formattedTrips = trips.map(t => {
    let status = 'Upcoming';
    if (t.startDate && t.endDate) {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      if (now >= start && now <= end) {
        status = 'Active';
      } else if (now > end) {
        status = 'Completed';
      }
    }
    return {
      id: t.id,
      name: t.name,
      startDate: t.startDate,
      endDate: t.endDate,
      status,
      stopsCount: t.stops.length
    };
  });

  return {
    trips: formattedTrips
  };
};

/**
 * Retrieves destination statistics (countries/cities count, distributions).
 */
const getDestinationAnalytics = async (userId, filters = {}) => {
  const stopWhere = buildStopWhere(userId, filters);

  const stops = await prisma.tripStop.findMany({
    where: stopWhere,
    include: {
      city: true
    }
  });

  const cityVisits = {};
  const countryVisits = {};

  stops.forEach(stop => {
    if (stop.city) {
      const { name, country, lat, lng } = stop.city;
      const cityKey = `${name}, ${country}`;

      if (!cityVisits[cityKey]) {
        cityVisits[cityKey] = { name, country, lat, lng, count: 0 };
      }
      cityVisits[cityKey].count++;

      if (!countryVisits[country]) {
        countryVisits[country] = 0;
      }
      countryVisits[country]++;
    }
  });

  const topCities = Object.values(cityVisits)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const countriesList = Object.keys(countryVisits).map(cName => ({
    country: cName,
    count: countryVisits[cName]
  })).sort((a, b) => b.count - a.count);

  return {
    totalDestinations: stops.length,
    countriesCount: Object.keys(countryVisits).length,
    citiesCount: Object.keys(cityVisits).length,
    topDestinations: topCities,
    countriesVisited: countriesList
  };
};

/**
 * Retrieves activity logs and histories from ItineraryActivity.
 */
const getActivityAnalytics = async (userId, filters = {}) => {
  // Activity query linked to user's trips
  const activityWhere = {
    OR: [
      {
        tripStop: {
          trip: {
            userId
          }
        }
      },
      {
        itineraryItem: {
          trip: {
            userId
          }
        }
      }
    ]
  };

  // Enforce tripId filter
  if (filters.tripId) {
    activityWhere.OR = [
      {
        tripStop: {
          tripId: filters.tripId
        }
      },
      {
        itineraryItem: {
          tripId: filters.tripId
        }
      }
    ];
  }

  // Enforce date ranges
  if (filters.startDate || filters.endDate) {
    const dateFilter = {};
    if (filters.startDate) dateFilter.gte = new Date(filters.startDate);
    if (filters.endDate) dateFilter.lte = new Date(filters.endDate);
    
    activityWhere.scheduledAt = dateFilter;
  }

  const activities = await prisma.itineraryActivity.findMany({
    where: activityWhere,
    include: {
      itineraryItem: {
        select: {
          title: true,
          trip: {
            select: {
              name: true
            }
          }
        }
      },
      tripStop: {
        select: {
          city: {
            select: {
              name: true
            }
          },
          trip: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20 // Recent 20 logs
  });

  const formattedActivities = activities.map(act => {
    const tripName = act.itineraryItem?.trip?.name || act.tripStop?.trip?.name || 'Unknown Trip';
    const location = act.tripStop?.city?.name || 'Itinerary Schedule';
    return {
      id: act.id,
      title: act.title || 'Sub-activity',
      notes: act.notes,
      scheduledAt: act.scheduledAt,
      createdAt: act.createdAt,
      tripName,
      location
    };
  });

  // Calculate stats
  const activityCount = formattedActivities.length;

  return {
    activityCount,
    recentActivities: formattedActivities
  };
};

module.exports = {
  getOverview,
  getExpenseAnalytics,
  getTripAnalytics,
  getDestinationAnalytics,
  getActivityAnalytics
};
