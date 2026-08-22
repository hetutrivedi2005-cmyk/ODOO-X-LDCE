const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all history routes
router.use(protect);

// Routes mapped under /api/trips
router.get('/:tripId/history', historyController.getHistory);
router.get('/:tripId/history/:activityId', historyController.getActivityDetail);

module.exports = router;
