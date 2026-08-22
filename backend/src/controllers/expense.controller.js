const expenseService = require('../services/expense.service');

/**
 * Helper to check if a date string is valid.
 */
const isValidDate = (dateStr) => {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
};

/**
 * Get all expenses of a trip.
 */
const get = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const expenses = await expenseService.getExpenses(tripId, req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        expenses,
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
 * Create a new expense.
 */
const create = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { amount, currency, category, description, spentAt } = req.body;

    // Validations
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
      });
    }

    if (!currency || typeof currency !== 'string' || currency.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Currency is required',
      });
    }

    if (spentAt && !isValidDate(spentAt)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for spentAt',
      });
    }

    const expense = await expenseService.createExpense(tripId, req.user.id, {
      amount: parsedAmount,
      currency,
      category,
      description,
      spentAt,
    });

    return res.status(201).json({
      success: true,
      data: {
        expense,
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
 * Update an existing expense.
 */
const update = async (req, res, next) => {
  try {
    const { tripId, expenseId } = req.params;
    const { amount, currency, spentAt } = req.body;

    // Validations on provided fields
    if (amount !== undefined && amount !== null) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number',
        });
      }
    }

    if (currency !== undefined && (typeof currency !== 'string' || currency.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Currency cannot be empty',
      });
    }

    if (spentAt !== undefined && spentAt !== null && !isValidDate(spentAt)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for spentAt',
      });
    }

    const expense = await expenseService.updateExpense(tripId, expenseId, req.user.id, req.body);

    return res.status(200).json({
      success: true,
      data: {
        expense,
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
 * Delete an expense.
 */
const deleteOne = async (req, res, next) => {
  try {
    const { tripId, expenseId } = req.params;
    await expenseService.deleteExpense(tripId, expenseId, req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
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
 * Get expense summary.
 */
const getSummary = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const summary = await expenseService.getSummary(tripId, req.user.id);
    return res.status(200).json({
      success: true,
      data: summary,
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
  get,
  create,
  update,
  deleteOne,
  getSummary,
};
