const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all expense routes
router.use(protect);

// Routes mapped under /api/trips
router.route('/:tripId/expenses')
  .get(expenseController.get)
  .post(expenseController.create);

router.route('/:tripId/expenses/summary')
  .get(expenseController.getSummary);

router.route('/:tripId/expenses/:expenseId')
  .patch(expenseController.update)
  .delete(expenseController.deleteOne);

module.exports = router;
