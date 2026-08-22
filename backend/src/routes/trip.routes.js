const express = require('express');
const tripController = require('../controllers/trip.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All trip routes require authentication protection
router.use(protect);

// Base trip operations
router.post('/', tripController.create);
router.get('/', tripController.getAll);
router.get('/:id', tripController.getOne);
router.put('/:id', tripController.update);
router.delete('/:id', tripController.deleteOne);

// Trip stop operations
router.post('/:tripId/stops', tripController.addStop);
router.delete('/:tripId/stops/:stopId', tripController.removeStop);

module.exports = router;
