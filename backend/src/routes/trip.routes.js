const express = require('express');
const tripController = require('../controllers/trip.controller');
const shareController = require('../controllers/share.controller');
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

// Trip public sharing operations
router.post('/:tripId/share', shareController.createShare);
router.get('/:tripId/shares', shareController.listShares);
router.delete('/:tripId/share/:shareId', shareController.revokeShare);

module.exports = router;
