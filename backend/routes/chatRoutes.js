
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); 
const { processChat, getChatHistory, deleteChat, clearAll, getMessagesBySession } = require('../controllers/chatController');

router.post('/send', authMiddleware, processChat);
router.get('/history', authMiddleware, getChatHistory);
router.delete('/delete', authMiddleware, deleteChat);
router.delete('/clear', authMiddleware, clearAll);

router.get('/history/:sessionId', authMiddleware, getMessagesBySession);

module.exports = router;