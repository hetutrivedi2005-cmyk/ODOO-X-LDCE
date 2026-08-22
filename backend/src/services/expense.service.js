const prisma = require('../config/prisma');
const { logActivity } = require('./activityLog.service');

/**
 * Verify trip existence and ownership.
 */
const verifyTripOwnership = async (tripId, userId) => {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });
  if (!trip) {
    const error = new Error('Trip not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  return trip;
};

/**
 * Get all expenses of a trip.
 */
const getExpenses = async (tripId, userId) => {
  await verifyTripOwnership(tripId, userId);
  return await prisma.expense.findMany({
    where: { tripId },
    orderBy: { spentAt: 'desc' },
  });
};

/**
 * Create a new expense.
 */
const createExpense = async (tripId, userId, { amount, currency, category, description, spentAt }) => {
  await verifyTripOwnership(tripId, userId);
  const expense = await prisma.expense.create({
    data: {
      tripId,
      amount: parseFloat(amount),
      currency: currency.trim().toUpperCase(),
      category: category ? category.trim() : 'Other',
      description: description ? description.trim() : null,
      spentAt: spentAt ? new Date(spentAt) : new Date(),
    },
  });

  // Log activity
  logActivity({
    userId,
    tripId,
    action: 'EXPENSE_ADDED',
    entityType: 'EXPENSE',
    entityId: expense.id,
    description: `Added expense: ${expense.currency} ${expense.amount} (${expense.category})`,
    metadata: { amount: expense.amount, currency: expense.currency, category: expense.category },
  });

  return expense;
};

/**
 * Update an existing expense.
 */
const updateExpense = async (tripId, expenseId, userId, data) => {
  await verifyTripOwnership(tripId, userId);

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tripId },
  });

  if (!expense) {
    const error = new Error('Expense not found');
    error.statusCode = 404;
    throw error;
  }

  const updateData = { ...data };
  if (updateData.amount !== undefined) updateData.amount = parseFloat(updateData.amount);
  if (updateData.currency !== undefined) updateData.currency = updateData.currency.trim().toUpperCase();
  if (updateData.category !== undefined) updateData.category = updateData.category ? updateData.category.trim() : 'Other';
  if (updateData.description !== undefined) updateData.description = updateData.description ? updateData.description.trim() : null;
  if (updateData.spentAt !== undefined) updateData.spentAt = new Date(updateData.spentAt);

  const updatedExpense = await prisma.expense.update({
    where: { id: expenseId },
    data: updateData,
  });

  // Log activity
  logActivity({
    userId,
    tripId,
    action: 'EXPENSE_UPDATED',
    entityType: 'EXPENSE',
    entityId: expenseId,
    description: `Updated expense: ${updatedExpense.currency} ${updatedExpense.amount}`,
    metadata: { amount: updatedExpense.amount, category: updatedExpense.category },
  });

  return updatedExpense;
};

/**
 * Delete an expense.
 */
const deleteExpense = async (tripId, expenseId, userId) => {
  await verifyTripOwnership(tripId, userId);

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tripId },
  });

  if (!expense) {
    const error = new Error('Expense not found');
    error.statusCode = 404;
    throw error;
  }

  const result = await prisma.expense.delete({
    where: { id: expenseId },
  });

  // Log activity
  logActivity({
    userId,
    tripId,
    action: 'EXPENSE_DELETED',
    entityType: 'EXPENSE',
    entityId: expenseId,
    description: `Deleted expense: ${expense.currency} ${expense.amount} (${expense.category})`,
    metadata: { amount: expense.amount, category: expense.category },
  });

  return result;
};

/**
 * Get the budget summary for a trip.
 */
const getSummary = async (tripId, userId) => {
  const trip = await verifyTripOwnership(tripId, userId);

  const expenses = await prisma.expense.findMany({
    where: { tripId },
    orderBy: { spentAt: 'desc' },
  });

  const expenseCount = expenses.length;
  let totalAmount = 0;

  const currencyTotalsMap = {};
  const categoryTotalsMap = {};

  expenses.forEach((exp) => {
    totalAmount += exp.amount;

    currencyTotalsMap[exp.currency] = (currencyTotalsMap[exp.currency] || 0) + exp.amount;

    const cat = exp.category || 'Other';
    categoryTotalsMap[cat] = (categoryTotalsMap[cat] || 0) + exp.amount;
  });

  const byCurrency = Object.keys(currencyTotalsMap).map((curr) => ({
    currency: curr,
    total: currencyTotalsMap[curr],
  }));

  const byCategory = Object.keys(categoryTotalsMap).map((cat) => ({
    category: cat,
    total: categoryTotalsMap[cat],
  }));

  const recentExpenses = expenses.slice(0, 5);

  return {
    tripName: trip.name,
    budget: trip.budget,
    totalAmount,
    expenseCount,
    byCurrency,
    byCategory,
    recentExpenses,
  };
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
};
