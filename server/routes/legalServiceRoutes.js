const express = require('express');
const router = express.Router();
const legalServiceController = require('../controllers/legalServiceController');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');

router.post('/add', authMiddleware, legalServiceController.addService);
router.get('/', optionalAuth, legalServiceController.getAllServices);
router.get('/:id', optionalAuth, legalServiceController.getServiceById);

module.exports = router;
