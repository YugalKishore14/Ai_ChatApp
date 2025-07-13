const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: [10000, 'Message content cannot exceed 10000 characters']
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        model: String,
        tokens: Number,
        processingTime: Number
    }
});

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        maxlength: [100, 'Title cannot exceed 100 characters'],
        default: 'New Chat'
    },
    messages: [messageSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    totalMessages: {
        type: Number,
        default: 0
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ userId: 1, isActive: 1 });
chatSessionSchema.index({ lastActivity: -1 });

// Update total messages count when messages are added
chatSessionSchema.pre('save', function (next) {
    this.totalMessages = this.messages.length;
    this.lastActivity = new Date();
    next();
});

// Static method to get user's chat sessions
chatSessionSchema.statics.getUserSessions = function (userId, limit = 20) {
    return this.find({ userId, isActive: true })
        .sort({ lastActivity: -1 })
        .limit(limit)
        .populate('userId', 'name email');
};

// Static method to get all sessions for admin
chatSessionSchema.statics.getAllSessions = function (limit = 50) {
    return this.find({ isActive: true })
        .sort({ lastActivity: -1 })
        .limit(limit)
        .populate('userId', 'name email role');
};

// Method to add a message to the session
chatSessionSchema.methods.addMessage = function (role, content, metadata = {}) {
    this.messages.push({
        role,
        content,
        metadata,
        timestamp: new Date()
    });

    // Auto-generate title from first user message if not set
    if (!this.title || this.title === 'New Chat') {
        if (role === 'user' && this.messages.length === 1) {
            this.title = content.length > 50 ? content.substring(0, 47) + '...' : content;
        }
    }

    return this.save();
};

module.exports = mongoose.model('ChatSession', chatSessionSchema);
