const express = require('express');
const shareController = require('../controllers/share.controller');

const router = express.Router();

// Publicly view shared trip without authentication
router.get('/shared/:shareToken', shareController.getSharedTrip);

module.exports = router;
