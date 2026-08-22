const prisma = require('../config/prisma');
const { logActivity } = require('./activityLog.service');

/**
 * Create a new trip.
 */
const createTrip = async ({ userId, name, description, startDate, endDate, coverImage, budget }) => {
  const trip = await prisma.trip.create({
    data: {
      userId,
      name,
      description,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      coverImage,
      budget: budget ? parseFloat(budget) : null,
    },
  });

  // Log activity
  logActivity({
    userId,
    tripId: trip.id,
    action: 'TRIP_CREATED',
    entityType: 'TRIP',
    entityId: trip.id,
    description: `Created trip "${trip.name}"`,
    metadata: { name: trip.name, startDate, endDate },
  });

  return trip;
};

/**
 * Get all trips belonging to a user.
 */
const getTrips = async (userId) => {
  return await prisma.trip.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get a single trip with its stops and city details.
 */
const getTripById = async (id, userId) => {
  const trip = await prisma.trip.findFirst({
    where: { id, userId },
    include: {
      stops: {
        include: {
          city: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  return trip;
};

/**
 * Update trip details.
 */
const updateTrip = async (id, userId, data) => {
  // Verify ownership first
  const trip = await prisma.trip.findFirst({
    where: { id, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // Sanitize and format dates if provided
  const updateData = { ...data };
  if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
  if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

  const updatedTrip = await prisma.trip.update({
    where: { id },
    data: updateData,
  });

  // Log activity
  logActivity({
    userId,
    tripId: id,
    action: 'TRIP_UPDATED',
    entityType: 'TRIP',
    entityId: id,
    description: `Updated trip "${updatedTrip.name}" details`,
    metadata: { updatedFields: Object.keys(data) },
  });

  return updatedTrip;
};

/**
 * Delete a trip.
 */
const deleteTrip = async (id, userId) => {
  // Verify ownership first
  const trip = await prisma.trip.findFirst({
    where: { id, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.trip.delete({
    where: { id },
  });
};

/**
 * Add a city stop to a trip.
 */
const addStop = async (tripId, userId, { cityId, startDate, endDate }) => {
  // Verify trip exists and belongs to the authenticated user
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify city exists in the database
  const city = await prisma.city.findUnique({
    where: { id: cityId },
  });

  if (!city) {
    const error = new Error('City not found');
    error.statusCode = 404;
    throw error;
  }

  // Calculate the next sequence/order number
  const lastStop = await prisma.tripStop.findFirst({
    where: { tripId },
    orderBy: { order: 'desc' },
  });
  const nextOrder = lastStop ? lastStop.order + 1 : 1;

  // Create the stop record
  const stop = await prisma.tripStop.create({
    data: {
      tripId,
      cityId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      order: nextOrder,
    },
    include: {
      city: true,
    },
  });

  // Log activity
  logActivity({
    userId,
    tripId,
    action: 'DESTINATION_ADDED',
    entityType: 'DESTINATION',
    entityId: stop.id,
    description: `Added destination ${city.name}, ${city.country}`,
    metadata: { cityName: city.name, country: city.country },
  });

  return stop;
};

/**
 * Remove a stop from a trip.
 */
const removeStop = async (tripId, userId, stopId) => {
  // Verify trip exists and belongs to user
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify stop exists and belongs to this trip
  const stop = await prisma.tripStop.findFirst({
    where: { id: stopId, tripId },
    include: { city: true },
  });

  if (!stop) {
    const error = new Error('Stop not found in this trip');
    error.statusCode = 404;
    throw error;
  }

  const result = await prisma.tripStop.delete({
    where: { id: stopId },
  });

  // Log activity
  logActivity({
    userId,
    tripId,
    action: 'DESTINATION_REMOVED',
    entityType: 'DESTINATION',
    entityId: stopId,
    description: `Removed destination ${stop.city ? stop.city.name : 'stop'}`,
    metadata: { cityName: stop.city ? stop.city.name : null },
  });

  return result;
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addStop,
  removeStop,
};
