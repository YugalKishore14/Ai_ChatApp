const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllChatHistory,
    getChatSessionDetails,
    exportChatData,
    getDashboardStats,
    getPendingUsers,
    approveUser,
    rejectUser
} = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middlewares/verifyToken');
const { validateUserUpdate } = require('../middlewares/validation');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(verifyAdmin);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', getDashboardStats);

// @route   GET /api/admin/users/pending
// @desc    Get pending users awaiting approval
// @access  Admin
router.get('/users/pending', getPendingUsers);

// @route   POST /api/admin/users/:userId/approve
// @desc    Approve a user
// @access  Admin
router.post('/users/:userId/approve', approveUser);

// @route   DELETE /api/admin/users/:userId/reject
// @desc    Reject a user registration
// @access  Admin
router.delete('/users/:userId/reject', rejectUser);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:userId
// @desc    Get user by ID
// @access  Admin
router.get('/users/:userId', getUserById);

// @route   PUT /api/admin/users/:userId
// @desc    Update user
// @access  Admin
router.put('/users/:userId', validateUserUpdate, updateUser);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete user
// @access  Admin
router.delete('/users/:userId', deleteUser);

// @route   GET /api/admin/chat-history
// @desc    Get all chat history
// @access  Admin
router.get('/chat-history', getAllChatHistory);

// @route   GET /api/admin/chat-sessions/:sessionId
// @desc    Get chat session details
// @access  Admin
router.get('/chat-sessions/:sessionId', getChatSessionDetails);

// @route   GET /api/admin/export-chats
// @desc    Export chat data
// @access  Admin
router.get('/export-chats', exportChatData);

module.exports = router;
