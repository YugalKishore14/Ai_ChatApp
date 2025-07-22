const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true // 5-min validity ke liye store hoga
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    used: {
        type: Boolean,
        default: false // OTP initially unused
    },
    resend: {
        type: Boolean,
        default: false // agar resend OTP hai toh true hoga
    }
});

module.exports = mongoose.model('Otp', otpSchema);
