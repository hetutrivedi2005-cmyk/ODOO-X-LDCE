const express = require('express');
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Enforce auth protection for all reporting endpoints
router.use(protect);

router.get('/overview', reportController.getOverview);
router.get('/expenses', reportController.getExpenseAnalytics);
router.get('/destinations', reportController.getDestinationAnalytics);
router.get('/trips', reportController.getTripAnalytics);
router.get('/activity', reportController.getActivityAnalytics);

module.exports = router;
