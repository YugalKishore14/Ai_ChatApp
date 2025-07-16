const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const Otp = require('../models/otp.model');
const { sendEmail } = require('../services/email.service');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret';

// -------------------- TOKEN HELPERS --------------------
const generateTokens = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
    const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
};

const getUserData = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
});

// -------------------- REGISTER --------------------
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => {
                switch (error.path) {
                    case 'name': return 'Name must be at least 2 characters long';
                    case 'email': return 'Please provide a valid email address';
                    case 'password': return 'Password must be at least 6 characters long';
                    default: return error.msg;
                }
            });
            return res.status(400).json({ message: errorMessages[0], errors: errorMessages });
        }

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        await user.save();

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 3 * 60 * 1000) // 2 mins
        });

        await sendEmail(
            email,
            'Your OTP Code',
            `<h1>Your OTP is: ${otp}</h1><p>This OTP is valid for 2 minutes.</p>`
        );

        res.status(201).json({
            message: 'Account created successfully! OTP sent to your email.',
            email: user.email
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// -------------------- LOGIN --------------------
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 2 * 60 * 1000)
        });

        await sendEmail(
            email,
            'Your OTP Code',
            `<h1>Your OTP is: ${otp}</h1><p>This OTP is valid for 2 minutes.</p>`
        );

        return res.status(200).json({ message: 'OTP sent to your email', email });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// -------------------- OTP VERIFY --------------------
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const record = await Otp.findOne({ email, otp });

        if (!record) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (record.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isVerified = true;
        user.lastLogin = new Date();

        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshTokens.push({ token: refreshToken });
        if (user.refreshTokens.length > 5) {
            user.refreshTokens = user.refreshTokens.slice(-5);
        }

        await user.save();

        return res.status(200).json({
            message: 'OTP verified successfully',
            token: accessToken,
            refreshToken,
            user: getUserData(user)
        });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Server error during OTP verification' });
    }
};

// -------------------- EMAIL VERIFY --------------------
exports.verifyEmail = async (req, res) => {
    const token = req.params.token;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isVerified = true;
        await user.save();

        res.redirect('http://localhost:3000/login');

    } catch (error) {
        console.error('Email Verification Error:', error);
        return res.status(400).json({ message: 'Invalid or expired token' });
    }
};

// -------------------- TOKEN REFRESH --------------------
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'Refresh token is required' });

        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid refresh token' });

        const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
        if (!tokenExists) return res.status(401).json({ message: 'Refresh token not found' });

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
        user.refreshTokens.push({ token: newRefreshToken });
        await user.save();

        res.json({
            message: 'Tokens refreshed successfully',
            token: accessToken,
            refreshToken: newRefreshToken,
            user: getUserData(user)
        });

    } catch (error) {
        console.error('Refresh Token Error:', error);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

// -------------------- LOGOUT --------------------
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const userId = req.user.id;

        if (refreshToken) {
            await User.findByIdAndUpdate(userId, {
                $pull: { refreshTokens: { token: refreshToken } }
            });
        } else {
            await User.findByIdAndUpdate(userId, {
                $set: { refreshTokens: [] }
            });
        }

        res.json({ message: 'Logged out successfully' });

    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

// -------------------- PROFILE --------------------
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isActive) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: getUserData(user) });

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
