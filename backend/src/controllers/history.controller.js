const activityLogService = require('../services/activityLog.service');

/**
 * Get paginated trip activity history.
 */
const getHistory = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { page, limit, entityType, action } = req.query;

    const result = await activityLogService.getTripHistory(tripId, req.user.id, {
      page,
      limit,
      entityType,
      action,
    });

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
 * Get single activity log detail.
 */
const getActivityDetail = async (req, res, next) => {
  try {
    const { tripId, activityId } = req.params;

    const activity = await activityLogService.getActivityById(tripId, activityId, req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        activity,
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

module.exports = {
  getHistory,
  getActivityDetail,
};
