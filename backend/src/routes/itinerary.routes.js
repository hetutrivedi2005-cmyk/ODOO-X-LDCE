const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itinerary.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all itinerary routes
router.use(protect);

// Routes mapped under /api/trips
router.route('/:tripId/itinerary')
  .post(itineraryController.create)
  .get(itineraryController.get);

router.route('/:tripId/itinerary/:itemId')
  .put(itineraryController.update)
  .delete(itineraryController.deleteOne);

module.exports = router;
