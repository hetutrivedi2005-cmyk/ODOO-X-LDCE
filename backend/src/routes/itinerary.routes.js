const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itinerary.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all itinerary routes
router.use(protect);

// Reorder endpoint (MUST come before /:itemId param route)
router.patch('/:tripId/itinerary/reorder', itineraryController.reorder);

// Routes mapped under /api/trips
router.route('/:tripId/itinerary')
  .post(itineraryController.create)
  .get(itineraryController.get);

router.route('/:tripId/itinerary/:itemId')
  .put(itineraryController.update)
  .patch(itineraryController.update)
  .delete(itineraryController.deleteOne);

// Sub-activities routes
router.post('/:tripId/itinerary/:itemId/activities', itineraryController.createActivity);
router.patch('/:tripId/itinerary/:itemId/activities/:activityId', itineraryController.updateActivity);
router.delete('/:tripId/itinerary/:itemId/activities/:activityId', itineraryController.deleteActivity);

module.exports = router;
