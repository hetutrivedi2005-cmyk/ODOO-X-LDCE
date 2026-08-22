const prisma = require('../config/prisma');

/**
 * Helper to get date boundaries for a specific day.
 */
const getDateBoundaries = (dateStr) => {
  const date = new Date(dateStr);
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
};

/**
 * Create a new day-wise itinerary activity.
 */
const createItem = async (tripId, userId, { tripStopId, title, description, date, startTime, endTime, location }) => {
  // 1. Verify trip exists and belongs to the authenticated user
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. If tripStopId is provided, verify it belongs to this trip
  if (tripStopId) {
    const stop = await prisma.tripStop.findFirst({
      where: { id: tripStopId, tripId },
    });

    if (!stop) {
      const error = new Error('Trip stop does not belong to this trip');
      error.statusCode = 400;
      throw error;
    }
  }

  // Calculate day boundaries
  const { startOfDay, endOfDay } = getDateBoundaries(date);

  // 3. Calculate next order for this date
  const lastItem = await prisma.itineraryItem.findFirst({
    where: {
      tripId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { order: 'desc' },
  });
  const nextOrder = lastItem ? lastItem.order + 1 : 1;

  // 4. Create the itinerary item
  return await prisma.itineraryItem.create({
    data: {
      tripId,
      tripStopId: tripStopId || null,
      title: title.trim(),
      description,
      date: startOfDay,
      startTime,
      endTime,
      location,
      order: nextOrder,
    },
  });
};

/**
 * Get all itinerary items of a trip, grouped and sorted.
 */
const getItinerary = async (tripId, userId) => {
  // Verify trip ownership
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // Fetch all itinerary items sorted chronologically, then by day-wise order
  const items = await prisma.itineraryItem.findMany({
    where: { tripId },
    include: {
      tripStop: {
        include: {
          city: true,
        },
      },
    },
    orderBy: [
      { date: 'asc' },
      { order: 'asc' },
    ],
  });

  // Group items by YYYY-MM-DD
  const grouped = {};
  items.forEach((item) => {
    const dateStr = item.date.toISOString().split('T')[0];
    if (!grouped[dateStr]) {
      grouped[dateStr] = [];
    }
    grouped[dateStr].push(item);
  });

  // Convert map to array structure sorted by date
  const itinerary = Object.keys(grouped).map((date) => ({
    date,
    items: grouped[date],
  }));

  return itinerary;
};

/**
 * Update an itinerary item.
 */
const updateItem = async (tripId, itemId, userId, data) => {
  // 1. Verify trip ownership
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify itinerary item exists and belongs to this trip
  const item = await prisma.itineraryItem.findFirst({
    where: { id: itemId, tripId },
  });

  if (!item) {
    const error = new Error('Itinerary item not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = { ...data };

  // 3. Validate tripStopId if updated
  if (updateData.tripStopId) {
    const stop = await prisma.tripStop.findFirst({
      where: { id: updateData.tripStopId, tripId },
    });

    if (!stop) {
      const error = new Error('Trip stop does not belong to this trip');
      error.statusCode = 400;
      throw error;
    }
  }

  // 4. Handle date changes (and recalculate day-wise order)
  if (updateData.date) {
    const originalDateStr = item.date.toISOString().split('T')[0];
    const newDateStr = new Date(updateData.date).toISOString().split('T')[0];

    // Recalculate order only if the date is actually changing
    if (originalDateStr !== newDateStr) {
      const { startOfDay, endOfDay } = getDateBoundaries(updateData.date);
      updateData.date = startOfDay;

      const lastItemForNewDate = await prisma.itineraryItem.findFirst({
        where: {
          tripId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: { order: 'desc' },
      });
      updateData.order = lastItemForNewDate ? lastItemForNewDate.order + 1 : 1;
    } else {
      // Date didn't change, just format correctly
      updateData.date = item.date;
    }
  }

  // 5. Update database record
  return await prisma.itineraryItem.update({
    where: { id: itemId },
    data: updateData,
  });
};

/**
 * Delete an itinerary item.
 */
const deleteItem = async (tripId, itemId, userId) => {
  // 1. Verify trip ownership
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify itinerary item exists and belongs to this trip
  const item = await prisma.itineraryItem.findFirst({
    where: { id: itemId, tripId },
  });

  if (!item) {
    const error = new Error('Itinerary item not found');
    error.statusCode = 404;
    throw error;
  }

  // 3. Delete the item
  return await prisma.itineraryItem.delete({
    where: { id: itemId },
  });
};

module.exports = {
  createItem,
  getItinerary,
  updateItem,
  deleteItem,
};
