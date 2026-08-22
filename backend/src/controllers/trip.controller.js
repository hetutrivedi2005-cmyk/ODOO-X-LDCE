const tripService = require('../services/trip.service');
const prisma = require('../config/prisma');

/**
 * Helper to validate date ranges.
 */
const isValidDateRange = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return true;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  // Verify date parsing is valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  
  return end >= start;
};

/**
 * Create a new trip.
 */
const create = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, coverImage } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required',
      });
    }

    if (!endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date is required',
      });
    }

    if (!isValidDateRange(startDate, endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must not be before start date',
      });
    }

    const trip = await tripService.createTrip({
      userId: req.user.id,
      name: name.trim(),
      description,
      startDate,
      endDate,
      coverImage,
    });

    return res.status(201).json({
      success: true,
      data: {
        trip,
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
 * Get all trips of the authenticated user.
 */
const getAll = async (req, res, next) => {
  try {
    const trips = await tripService.getTrips(req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        trips,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single trip with its stops.
 */
const getOne = async (req, res, next) => {
  try {
    const trip = await tripService.getTripById(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        trip,
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
 * Update a trip.
 */
const update = async (req, res, next) => {
  try {
    const { name, startDate, endDate } = req.body;

    // Run validations on provided fields
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty',
      });
    }

    // Resolve date boundary checks
    const finalStart = startDate || req.body.startDate;
    const finalEnd = endDate || req.body.endDate;
    if (finalStart || finalEnd) {
      // If updating dates, check ranges
      const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.user.id } });
      const currentStart = trip ? trip.startDate : null;
      const currentEnd = trip ? trip.endDate : null;

      const checkStart = finalStart || currentStart;
      const checkEnd = finalEnd || currentEnd;

      if (checkStart && checkEnd && !isValidDateRange(checkStart, checkEnd)) {
        return res.status(400).json({
          success: false,
          message: 'End date must not be before start date',
        });
      }
    }

    const trip = await tripService.updateTrip(req.params.id, req.user.id, req.body);
    return res.status(200).json({
      success: true,
      data: {
        trip,
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
 * Delete a trip.
 */
const deleteOne = async (req, res, next) => {
  try {
    await tripService.deleteTrip(req.params.id, req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
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
 * Add a stop/city to a trip.
 */
const addStop = async (req, res, next) => {
  try {
    const { cityId, startDate, endDate } = req.body;

    if (!cityId || typeof cityId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'City ID is required',
      });
    }

    if (startDate && endDate && !isValidDateRange(startDate, endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must not be before start date',
      });
    }

    const stop = await tripService.addStop(req.params.tripId, req.user.id, {
      cityId,
      startDate,
      endDate,
    });

    return res.status(201).json({
      success: true,
      data: {
        stop,
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
 * Remove a stop/city from a trip.
 */
const removeStop = async (req, res, next) => {
  try {
    await tripService.removeStop(req.params.tripId, req.user.id, req.params.stopId);
    return res.status(200).json({
      success: true,
      message: 'City removed from trip',
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
  create,
  getAll,
  getOne,
  update,
  deleteOne,
  addStop,
  removeStop,
};
