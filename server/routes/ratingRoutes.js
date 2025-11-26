const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, ratingController.addRating);
router.get('/provider/:providerId', ratingController.getProviderRatings);

module.exports = router;
