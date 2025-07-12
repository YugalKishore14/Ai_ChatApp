const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

dotenv.config();
const app = express();

// Security middleware - Update helmet configuration for deployment
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to avoid conflicts
  crossOriginOpenerPolicy: false, // Disable COOP header causing the warning
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin resources
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Update for production
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://34.42.233.32:5000',
    'https://34.42.233.32:5000'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add middleware to handle mixed content
app.use((req, res, next) => {
  // Allow mixed content for deployment
  res.setHeader('Content-Security-Policy', "upgrade-insecure-requests");
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist'), {
  setHeaders: (res, path) => {
    // Set proper MIME types
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
