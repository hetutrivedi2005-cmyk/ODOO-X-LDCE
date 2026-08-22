const itineraryService = require('../services/itinerary.service');
const prisma = require('../config/prisma');

// Regular expression to validate HH:MM 24-hour format
const timeFormatRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/**
 * Helper to validate time inputs.
 */
const isValidTime = (timeStr) => {
  return timeFormatRegex.test(timeStr);
};

/**
 * Helper to check if a date string is valid.
 */
const isValidDate = (dateStr) => {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

/**
 * Create a new itinerary item.
 */
const create = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { tripStopId, title, description, date, startTime, endTime, location } = req.body;

    // Validation checks
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required',
      });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    if (startTime && !isValidTime(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in HH:MM format',
      });
    }

    if (endTime && !isValidTime(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be in HH:MM format',
      });
    }

    if (startTime && endTime && endTime < startTime) {
      return res.status(400).json({
        success: false,
        message: 'End time cannot be before start time',
      });
    }

    const item = await itineraryService.createItem(tripId, req.user.id, {
      tripStopId,
      title,
      description,
      date,
      startTime,
      endTime,
      location,
    });

    return res.status(201).json({
      success: true,
      data: {
        item,
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
 * Get complete grouped and sorted itinerary for a trip.
 */
const get = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const itinerary = await itineraryService.getItinerary(tripId, req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        itinerary,
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
 * Update an itinerary item.
 */
const update = async (req, res, next) => {
  try {
    const { tripId, itemId } = req.params;
    const { title, date, startTime, endTime } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot be empty',
      });
    }

    if (date !== undefined && !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    if (startTime !== undefined && startTime !== null && !isValidTime(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in HH:MM format',
      });
    }

    if (endTime !== undefined && endTime !== null && !isValidTime(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be in HH:MM format',
      });
    }

    if (startTime !== undefined || endTime !== undefined) {
      const dbItem = await prisma.itineraryItem.findFirst({ where: { id: itemId, tripId } });
      if (dbItem) {
        const checkStart = startTime !== undefined ? startTime : dbItem.startTime;
        const checkEnd = endTime !== undefined ? endTime : dbItem.endTime;
        if (checkStart && checkEnd && checkEnd < checkStart) {
          return res.status(400).json({
            success: false,
            message: 'End time cannot be before start time',
          });
        }
      }
    }

    const item = await itineraryService.updateItem(tripId, itemId, req.user.id, req.body);

    return res.status(200).json({
      success: true,
      data: {
        item,
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
 * Delete an itinerary item.
 */
const deleteOne = async (req, res, next) => {
  try {
    const { tripId, itemId } = req.params;
    await itineraryService.deleteItem(tripId, itemId, req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Itinerary item deleted successfully',
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
 * Reorder itinerary items.
 */
const reorder = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { items, itemIds } = req.body;
    const list = items || itemIds;

    if (!list || !Array.isArray(list)) {
      return res.status(400).json({
        success: false,
        message: 'Reorder list (items or itemIds array) is required',
      });
    }

    const updatedItinerary = await itineraryService.reorderItems(tripId, req.user.id, list);

    return res.status(200).json({
      success: true,
      data: {
        itinerary: updatedItinerary,
      },
      message: 'Itinerary items reordered successfully',
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
 * Create a sub-activity on an itinerary item
 */
const createActivity = async (req, res, next) => {
  try {
    const { tripId, itemId } = req.params;
    const { title, notes, scheduledAt } = req.body;

    const activity = await itineraryService.createActivity(tripId, itemId, req.user.id, {
      title,
      notes,
      scheduledAt,
    });

    return res.status(201).json({
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

/**
 * Update a sub-activity
 */
const updateActivity = async (req, res, next) => {
  try {
    const { tripId, itemId, activityId } = req.params;

    const activity = await itineraryService.updateActivity(tripId, itemId, activityId, req.user.id, req.body);

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

/**
 * Delete a sub-activity
 */
const deleteActivity = async (req, res, next) => {
  try {
    const { tripId, itemId, activityId } = req.params;

    await itineraryService.deleteActivity(tripId, itemId, activityId, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
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
  get,
  update,
  deleteOne,
  reorder,
  createActivity,
  updateActivity,
  deleteActivity,
};
