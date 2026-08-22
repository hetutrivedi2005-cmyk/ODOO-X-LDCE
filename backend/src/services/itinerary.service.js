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
    include: {
      activities: true,
      tripStop: {
        include: {
          city: true,
        },
      },
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
      activities: true,
      tripStop: {
        include: {
          city: true,
        },
      },
    },
    orderBy: [{ date: 'asc' }, { order: 'asc' }],
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
      // Date didn't change, keep existing date
      updateData.date = item.date;
    }
  }

  // 5. Update database record
  return await prisma.itineraryItem.update({
    where: { id: itemId },
    data: updateData,
    include: {
      activities: true,
      tripStop: {
        include: {
          city: true,
        },
      },
    },
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

/**
 * Reorder itinerary items using a database transaction.
 * Supports items array: [{ id: "...", order: 1 }, { id: "...", order: 2 }]
 * or itemIds array: ["id1", "id2"]
 */
const reorderItems = async (tripId, userId, itemsList) => {
  // 1. Verify trip ownership
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  let updates = [];
  if (Array.isArray(itemsList)) {
    if (typeof itemsList[0] === 'string') {
      // Array of item ID strings
      updates = itemsList.map((id, index) => ({ id, order: index + 1 }));
    } else if (typeof itemsList[0] === 'object' && itemsList[0].id) {
      // Array of objects { id, order }
      updates = itemsList.map((item, index) => ({
        id: item.id,
        order: item.order !== undefined ? item.order : index + 1,
      }));
    }
  }

  if (updates.length === 0) {
    const error = new Error('Invalid items list for reordering');
    error.statusCode = 400;
    throw error;
  }

  // Execute order updates inside a transaction
  await prisma.$transaction(
    updates.map((update) =>
      prisma.itineraryItem.updateMany({
        where: { id: update.id, tripId },
        data: { order: update.order },
      })
    )
  );

  return await getItinerary(tripId, userId);
};

/**
 * Create a sub-activity on an itinerary item
 */
const createActivity = async (tripId, itemId, userId, { title, notes, scheduledAt }) => {
  // 1. Verify trip ownership
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify item belongs to trip
  const item = await prisma.itineraryItem.findFirst({
    where: { id: itemId, tripId },
  });

  if (!item) {
    const error = new Error('Itinerary item not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.itineraryActivity.create({
    data: {
      itineraryItemId: itemId,
      title: title ? title.trim() : 'Sub-activity',
      notes,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });
};

/**
 * Update a sub-activity on an itinerary item
 */
const updateActivity = async (tripId, itemId, activityId, userId, data) => {
  // 1. Verify trip ownership
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify activity exists and belongs to itinerary item
  const activity = await prisma.itineraryActivity.findFirst({
    where: { id: activityId, itineraryItemId: itemId },
  });

  if (!activity) {
    const error = new Error('Itinerary sub-activity not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.itineraryActivity.update({
    where: { id: activityId },
    data: {
      title: data.title !== undefined ? data.title : activity.title,
      notes: data.notes !== undefined ? data.notes : activity.notes,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : activity.scheduledAt,
    },
  });
};

/**
 * Delete a sub-activity on an itinerary item
 */
const deleteActivity = async (tripId, itemId, activityId, userId) => {
  // 1. Verify trip ownership
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify activity exists
  const activity = await prisma.itineraryActivity.findFirst({
    where: { id: activityId, itineraryItemId: itemId },
  });

  if (!activity) {
    const error = new Error('Itinerary sub-activity not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.itineraryActivity.delete({
    where: { id: activityId },
  });
};

module.exports = {
  createItem,
  getItinerary,
  updateItem,
  deleteItem,
  reorderItems,
  createActivity,
  updateActivity,
  deleteActivity,
};
