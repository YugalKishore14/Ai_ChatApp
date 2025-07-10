const express = require('express');
const { 
    register, 
    login, 
    refreshToken, 
    logout, 
    getProfile 
} = require('../controllers/authController');
const { verifyToken } = require('../middlewares/verifyToken');
const { 
    validateRegister, 
    validateLogin, 
    validateRefreshToken 
} = require('../middlewares/validation');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', validateRefreshToken, refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', verifyToken, logout);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', verifyToken, getProfile);

module.exports = router;
