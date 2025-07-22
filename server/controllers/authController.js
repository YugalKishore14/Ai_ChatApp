const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
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
            password,
            isVerified: true, // Email verification removed, default to verified
            isActive: true
        });

        await user.save();

        res.status(201).json({
            message: 'Account created successfully! You can now log in.',
            email: user.email
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// -------------------- LOGIN (Send OTP) --------------------
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
            email: email.toLowerCase().trim(),
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            used: false,
            resend: false
        });

        await sendEmail(
            email,
            'Your OTP Code',
            `<h1>Your OTP is: ${otp}</h1><p>This OTP is valid for 5 minutes.</p>`
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
        const record = await Otp.findOne({ email: email.toLowerCase().trim(), otp, used: false }).sort({ createdAt: -1 });
        if (!record) return res.status(400).json({ message: 'Invalid OTP' });

        if (record.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        record.used = true;
        await record.save();

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

// -------------------- RESEND OTP --------------------
exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const newOtp = await Otp.create({
            email: normalizedEmail,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            used: false,
            resend: true,
            createdAt: new Date()
        });

        await sendEmail(
            normalizedEmail,
            'Your OTP Code (Resent)',
            `<h1>Your new OTP is: ${otp}</h1><p>This OTP is valid for 5 minutes.</p>`
        );

        return res.status(200).json({
            message: 'New OTP sent to your email',
            email: normalizedEmail,
            otpId: newOtp._id
        });

    } catch (error) {
        console.error('Resend OTP Error:', error);
        return res.status(500).json({ message: 'Server error while resending OTP' });
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
