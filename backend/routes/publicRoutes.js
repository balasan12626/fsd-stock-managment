const express = require('express');
const router = express.Router();
const { getPublicStats, getRecommendations } = require('../controllers/analyticsController');

router.get('/stats', getPublicStats);
router.get('/recommend/:productId', getRecommendations);


module.exports = router;
