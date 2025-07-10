const User = require('../models/User');
const ChatSession = require('../models/ChatHistory');

// Get pending users awaiting approval
exports.getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ 
            isApproved: false,
            role: 'user' // Don't include admin users
        })
        .select('-password -refreshTokens')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            users: pendingUsers,
            count: pendingUsers.length
        });

    } catch (error) {
        console.error('Get Pending Users Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve pending users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Approve user
exports.approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.id;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isApproved) {
            return res.status(400).json({ message: 'User is already approved' });
        }

        // Approve the user
        user.isApproved = true;
        user.approvedBy = adminId;
        user.approvedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'User approved successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isApproved: user.isApproved,
                approvedAt: user.approvedAt
            }
        });

    } catch (error) {
        console.error('Approve User Error:', error);
        res.status(500).json({ 
            message: 'Failed to approve user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Reject/deny user
exports.rejectUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isApproved) {
            return res.status(400).json({ message: 'Cannot reject an already approved user' });
        }

        // Delete the user account (or you could set a rejected flag instead)
        await User.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'User registration rejected and removed',
            reason: reason || 'No reason provided'
        });

    } catch (error) {
        console.error('Reject User Error:', error);
        res.status(500).json({ 
            message: 'Failed to reject user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password -refreshTokens')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.json({
            success: true,
            users,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                hasNext: skip + limit < total,
                hasPrev: page > 1
            },
            count: total
        });

    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password -refreshTokens');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's chat statistics
        const chatStats = await ChatSession.aggregate([
            { $match: { userId: user._id, isActive: true } },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    totalMessages: { $sum: '$totalMessages' },
                    lastActivity: { $max: '$lastActivity' }
                }
            }
        ]);

        res.json({
            success: true,
            user,
            stats: chatStats[0] || {
                totalSessions: 0,
                totalMessages: 0,
                lastActivity: null
            }
        });

    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, role, isActive } = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from demoting themselves
        if (userId === req.user.id && role && role !== 'admin') {
            return res.status(400).json({ 
                message: 'You cannot change your own admin role' 
            });
        }

        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: userId }
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'Email is already taken by another user' 
                });
            }
        }

        // Update user fields
        if (name) user.name = name.trim();
        if (email) user.email = email.toLowerCase().trim();
        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            user: user.toJSON()
        });

    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ 
            message: 'Failed to update user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId === req.user.id) {
            return res.status(400).json({ 
                message: 'You cannot delete your own account' 
            });
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Soft delete: deactivate user instead of permanent deletion
        user.isActive = false;
        user.email = `deleted_${Date.now()}_${user.email}`;
        await user.save();

        // Also deactivate all user's chat sessions
        await ChatSession.updateMany(
            { userId: userId },
            { isActive: false }
        );

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ 
            message: 'Failed to delete user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all chat history (admin view)
exports.getAllChatHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const sessions = await ChatSession.getAllSessions(limit + skip);
        const paginatedSessions = sessions.slice(skip, skip + limit);

        const total = await ChatSession.countDocuments({ isActive: true });

        res.json({
            success: true,
            chats: paginatedSessions,
            pagination: {
                current: page,
                total: Math.ceil(total / limit),
                hasNext: skip + limit < total,
                hasPrev: page > 1
            },
            count: total
        });

    } catch (error) {
        console.error('Get All Chat History Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve chat history',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get chat session details (admin view)
exports.getChatSessionDetails = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await ChatSession.findById(sessionId)
            .populate('userId', 'name email role');

        if (!session) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        res.json({
            success: true,
            session
        });

    } catch (error) {
        console.error('Get Chat Session Details Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve chat session',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Export chat data
exports.exportChatData = async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.query;
        
        let query = { isActive: true };
        
        // Add date filter if provided
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        // Add user filter if provided
        if (userId) {
            query.userId = userId;
        }

        const sessions = await ChatSession.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        const exportData = {
            exportDate: new Date().toISOString(),
            totalSessions: sessions.length,
            filters: { startDate, endDate, userId },
            sessions: sessions.map(session => ({
                id: session._id,
                user: {
                    name: session.userId.name,
                    email: session.userId.email
                },
                title: session.title,
                messageCount: session.totalMessages,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity,
                messages: session.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp
                }))
            }))
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=chat-export-${new Date().toISOString().split('T')[0]}.json`);
        res.json(exportData);

    } catch (error) {
        console.error('Export Chat Data Error:', error);
        res.status(500).json({ 
            message: 'Failed to export chat data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const [userStats, chatStats] = await Promise.all([
            User.aggregate([
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        activeUsers: {
                            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                        },
                        admins: {
                            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
                        }
                    }
                }
            ]),
            ChatSession.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalSessions: { $sum: 1 },
                        totalMessages: { $sum: '$totalMessages' },
                        avgMessagesPerSession: { $avg: '$totalMessages' }
                    }
                }
            ])
        ]);

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivity = await ChatSession.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: sevenDaysAgo },
                    isActive: true 
                } 
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            stats: {
                users: userStats[0] || { totalUsers: 0, activeUsers: 0, admins: 0 },
                chats: chatStats[0] || { totalSessions: 0, totalMessages: 0, avgMessagesPerSession: 0 },
                recentActivity
            }
        });

    } catch (error) {
        console.error('Get Dashboard Stats Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
