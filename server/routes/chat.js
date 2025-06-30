const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify JWT
router.use((req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Token required' });

    try {
        const token = auth.split(' ')[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ error: 'Invalid token' });
    }
});

// Chat Route (Mock AI Response)
router.post('/', (req, res) => {
    const { message } = req.body;
    const aiResponse = `You said: "${message}". This is a dummy AI response.`;
    res.json({ aiMessage: aiResponse });
});

module.exports = router;
