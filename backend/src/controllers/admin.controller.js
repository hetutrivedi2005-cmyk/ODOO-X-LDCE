const adminService = require('../services/admin.service');

/**
 * Get platform overview.
 */
const getOverview = async (req, res, next) => {
  try {
    const overview = await adminService.getOverview();
    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get user list.
 */
const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get user detail.
 */
const getUserDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await adminService.getUserById(userId);
    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Update user status or role.
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status, role } = req.body;

    const user = await adminService.updateUserStatus(userId, { status, role }, req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        user,
      },
      message: 'User status updated successfully',
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get platform trips.
 */
const getTrips = async (req, res, next) => {
  try {
    const result = await adminService.getTrips(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get system activity logs.
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const result = await adminService.getActivityLogs(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get administrative reports.
 */
const getAdminReports = async (req, res, next) => {
  try {
    const reports = await adminService.getAdminReports();
    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getOverview,
  getUsers,
  getUserDetail,
  updateUserStatus,
  getTrips,
  getActivityLogs,
  getAdminReports,
};
