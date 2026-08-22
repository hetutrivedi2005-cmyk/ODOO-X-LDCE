const prisma = require('../config/prisma');
const { logActivity } = require('./activityLog.service');

/**
 * Get platform-wide overview statistics for admin dashboard.
 */
const getOverview = async () => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalTrips,
    completedTrips,
    expenseAgg,
    totalNotifications,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'INACTIVE' } }),
    prisma.trip.count(),
    prisma.trip.count({
      where: {
        endDate: {
          lt: new Date(),
        },
      },
    }),
    prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    }),
    prisma.notification.count(),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
    },
    trips: {
      total: totalTrips,
      completed: completedTrips,
      active: totalTrips - completedTrips,
    },
    expenses: {
      totalAmount: expenseAgg._sum.amount || 0,
    },
    notifications: {
      total: totalNotifications,
    },
    recentActivity,
  };
};

/**
 * Get paginated list of users with search and filtering.
 */
const getUsers = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page || 1, 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || 20, 10)));
  const skip = (page - 1) * limit;

  const where = {};
  if (query.search) {
    const s = query.search.trim();
    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
    ];
  }

  if (query.role && query.role !== 'ALL') {
    where.role = query.role;
  }

  if (query.status && query.status !== 'ALL') {
    where.status = query.status;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            trips: true,
            activityLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get single user details by ID.
 */
const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      trips: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          _count: {
            select: {
              stops: true,
              expenses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          activityLogs: true,
          notifications: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Update user status (ACTIVE/INACTIVE) or role (ADMIN/USER).
 */
const updateUserStatus = async (targetUserId, { status, role }, adminUserId) => {
  if (targetUserId === adminUserId && status === 'INACTIVE') {
    const error = new Error('You cannot deactivate your own admin account');
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = {};
  if (status && ['ACTIVE', 'INACTIVE'].includes(status)) {
    updateData.status = status;
  }
  if (role && ['USER', 'ADMIN'].includes(role)) {
    updateData.role = role;
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  // Log activity
  logActivity({
    userId: adminUserId,
    tripId: user.id, // Reference target user ID or general
    action: 'USER_STATUS_UPDATED',
    entityType: 'USER',
    entityId: targetUserId,
    description: `Admin updated user "${updatedUser.name || updatedUser.email}" status to ${updatedUser.status} (${updatedUser.role})`,
    metadata: { updatedFields: updateData },
  });

  return updatedUser;
};

/**
 * Get platform-wide trips list for monitoring.
 */
const getTrips = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page || 1, 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || 20, 10)));
  const skip = (page - 1) * limit;

  const where = {};
  if (query.search) {
    const s = query.search.trim();
    where.name = { contains: s, mode: 'insensitive' };
  }

  const [total, trips] = await Promise.all([
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            stops: true,
            expenses: true,
            itineraryItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    trips,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get platform-wide activity logs.
 */
const getActivityLogs = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page || 1, 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || 20, 10)));
  const skip = (page - 1) * limit;

  const where = {};
  if (query.action && query.action !== 'ALL') {
    where.action = query.action;
  }
  if (query.entityType && query.entityType !== 'ALL') {
    where.entityType = query.entityType;
  }
  if (query.userId) {
    where.userId = query.userId;
  }

  const [total, activityLogs] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    activityLogs,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Get system-wide admin analytics reports.
 */
const getAdminReports = async () => {
  const [
    userStats,
    tripStats,
    expenseAgg,
    categoryExpenses,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ['role', 'status'],
      _count: true,
    }),
    prisma.trip.count(),
    prisma.expense.aggregate({
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true,
    }),
    prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return {
    userStats,
    tripStats,
    expenseOverview: {
      totalAmount: expenseAgg._sum.amount || 0,
      averageExpense: expenseAgg._avg.amount || 0,
      totalCount: expenseAgg._count || 0,
    },
    categoryExpenses: categoryExpenses.map((c) => ({
      category: c.category || 'Other',
      amount: c._sum.amount || 0,
      count: c._count,
    })),
  };
};

module.exports = {
  getOverview,
  getUsers,
  getUserById,
  updateUserStatus,
  getTrips,
  getActivityLogs,
  getAdminReports,
};
