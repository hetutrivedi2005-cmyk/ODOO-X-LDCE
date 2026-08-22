const prisma = require('../config/prisma');

/**
 * Log an application activity event asynchronously.
 * Safe helper: catches and logs database errors without breaking the main API execution.
 */
const logActivity = async ({ userId, tripId, action, entityType, entityId, description, metadata }) => {
  try {
    if (!userId || !tripId || !action || !entityType || !description) {
      console.warn('[ActivityLog] Missing required fields for activity logging');
      return null;
    }

    return await prisma.activityLog.create({
      data: {
        userId,
        tripId,
        action,
        entityType,
        entityId: entityId ? String(entityId) : null,
        description,
        metadata: metadata ? metadata : undefined,
      },
    });
  } catch (error) {
    console.error('[ActivityLog] Error creating activity log:', error.message);
    return null;
  }
};

/**
 * Get paginated & filtered trip history for an authenticated user.
 */
const getTripHistory = async (tripId, userId, query = {}) => {
  // 1. Verify trip exists and belongs to user
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  const page = Math.max(1, parseInt(query.page || 1, 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || 20, 10)));
  const skip = (page - 1) * limit;

  // Build filter clause
  const where = { tripId, userId };
  if (query.entityType && query.entityType !== 'ALL') {
    where.entityType = query.entityType;
  }
  if (query.action) {
    where.action = query.action;
  }

  const [total, history] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    history,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get single activity log detail by ID.
 */
const getActivityById = async (tripId, activityId, userId) => {
  // 1. Verify trip ownership
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

  if (!trip) {
    const error = new Error('Trip not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Fetch log entry
  const logEntry = await prisma.activityLog.findFirst({
    where: { id: activityId, tripId, userId },
  });

  if (!logEntry) {
    const error = new Error('Activity log record not found');
    error.statusCode = 404;
    throw error;
  }

  return logEntry;
};

module.exports = {
  logActivity,
  getTripHistory,
  getActivityById,
};
