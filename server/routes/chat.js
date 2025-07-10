const express = require('express');
const { 
    sendMessage, 
    getChatHistory, 
    getChatSession, 
    deleteChatSession, 
    updateChatSession 
} = require('../controllers/chatController');
const { verifyToken } = require('../middlewares/verifyToken');
const { validateChatMessage } = require('../middlewares/validation');

const router = express.Router();

// All chat routes require authentication
router.use(verifyToken);

// @route   POST /api/chat/send
// @desc    Send a chat message
// @access  Private
router.post('/send', validateChatMessage, sendMessage);

// @route   GET /api/chat/history
// @desc    Get user's chat history
// @access  Private
router.get('/history', getChatHistory);

// @route   GET /api/chat/session/:sessionId
// @desc    Get a specific chat session
// @access  Private
router.get('/session/:sessionId', getChatSession);

// @route   DELETE /api/chat/session/:sessionId
// @desc    Delete a chat session
// @access  Private
router.delete('/session/:sessionId', deleteChatSession);

// @route   PUT /api/chat/session/:sessionId
// @desc    Update chat session title
// @access  Private
router.put('/session/:sessionId', updateChatSession);

module.exports = router;
