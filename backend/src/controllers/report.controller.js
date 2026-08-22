const reportService = require('../services/report.service');

/**
 * Parses query filter parameters.
 */
const parseFilters = (query) => {
  const { tripId, category, startDate, endDate } = query;
  return {
    tripId: tripId || null,
    category: category || null,
    startDate: startDate || null,
    endDate: endDate || null
  };
};

/**
 * Returns overall dashboard KPIs.
 */
const getOverview = async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const overview = await reportService.getOverview(req.user.id, filters);
    return res.status(200).json({
      success: true,
      data: {
        overview
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns spending category splits, averages, and historical splits.
 */
const getExpenseAnalytics = async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const expenses = await reportService.getExpenseAnalytics(req.user.id, filters);
    return res.status(200).json({
      success: true,
      data: {
        expenses
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns destination statistics (cities/countries breakdown).
 */
const getDestinationAnalytics = async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const destinations = await reportService.getDestinationAnalytics(req.user.id, filters);
    return res.status(200).json({
      success: true,
      data: {
        destinations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns trip counts and distribution list.
 */
const getTripAnalytics = async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const trips = await reportService.getTripAnalytics(req.user.id, filters);
    return res.status(200).json({
      success: true,
      data: {
        trips
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns itinerary activities logs.
 */
const getActivityAnalytics = async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const activity = await reportService.getActivityAnalytics(req.user.id, filters);
    return res.status(200).json({
      success: true,
      data: {
        activity
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getExpenseAnalytics,
  getDestinationAnalytics,
  getTripAnalytics,
  getActivityAnalytics
};
