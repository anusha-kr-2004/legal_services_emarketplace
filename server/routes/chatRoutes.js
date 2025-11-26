const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:bookingId', authMiddleware, chatController.getConversation);
router.post('/:bookingId', authMiddleware, chatController.sendMessage);

module.exports = router;







