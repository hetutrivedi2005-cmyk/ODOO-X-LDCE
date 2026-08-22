const express = require('express');
const recommendationController = require('../controllers/recommendation.controller');

const router = express.Router();

// Public recommendation endpoint
router.get('/recommendations', recommendationController.getRecommendations);

module.exports = router;
