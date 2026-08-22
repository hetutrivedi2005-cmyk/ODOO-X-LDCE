const crypto = require('crypto');
const prisma = require('../config/prisma');

/**
 * Generates a cryptographically secure share token.
 */
const generateToken = () => {
  return crypto.randomBytes(24).toString('hex');
};

/**
 * Creates a public share link for a trip.
 */
const createShare = async (tripId, userId, { expiresAt }) => {
  // Verify trip exists and belongs to user
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId }
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  const shareToken = generateToken();

  return await prisma.publicShare.create({
    data: {
      tripId,
      shareToken,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    }
  });
};

/**
 * Lists all share links created for a specific trip.
 */
const listShares = async (tripId, userId) => {
  // Verify trip ownership
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId }
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.publicShare.findMany({
    where: { tripId },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Revokes a public share link.
 */
const revokeShare = async (tripId, userId, shareId) => {
  // Verify trip ownership
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId }
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // Find share and ensure it matches the tripId
  const share = await prisma.publicShare.findFirst({
    where: { id: shareId, tripId }
  });

  if (!share) {
    const error = new Error('Share link not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.publicShare.delete({
    where: { id: shareId }
  });
};

/**
 * Fetches a shared trip's public data using its token.
 * Validates existence, revocation, and expiration.
 */
const getSharedTrip = async (shareToken) => {
  const share = await prisma.publicShare.findUnique({
    where: { shareToken },
    include: {
      trip: {
        include: {
          stops: {
            include: {
              city: true,
              itineraryActivities: {
                include: {
                  activity: true
                }
              }
            },
            orderBy: {
              order: 'asc'
            }
          },
          itineraryItems: {
            orderBy: {
              date: 'asc'
            }
          }
        }
      }
    }
  });

  if (!share) {
    const error = new Error('This shared trip link is invalid or has been revoked');
    error.statusCode = 404;
    throw error;
  }

  // Validate expiration server-side
  if (share.expiresAt && new Date() > new Date(share.expiresAt)) {
    const error = new Error('This shared trip link has expired');
    error.statusCode = 410; // Gone
    throw error;
  }

  const { trip } = share;

  // Format public response to hide sensitive details
  return {
    name: trip.name,
    description: trip.description,
    startDate: trip.startDate,
    endDate: trip.endDate,
    coverImage: trip.coverImage,
    stops: trip.stops.map(stop => ({
      order: stop.order,
      startDate: stop.startDate,
      endDate: stop.endDate,
      city: {
        name: stop.city.name,
        country: stop.city.country,
        lat: stop.city.lat,
        lng: stop.city.lng
      },
      activities: stop.itineraryActivities?.map(ia => ({
        name: ia.activity.name,
        description: ia.activity.description,
        scheduledAt: ia.scheduledAt,
        notes: ia.notes
      })) || []
    })),
    itineraryItems: trip.itineraryItems.map(item => ({
      title: item.title,
      description: item.description,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      order: item.order
    }))
  };
};

module.exports = {
  createShare,
  listShares,
  revokeShare,
  getSharedTrip
};
