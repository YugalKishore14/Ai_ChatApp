const ChatSession = require('../models/ChatHistory');
const axios = require('axios');

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Send a chat message
exports.sendMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user.id;
        
        // Get API key at runtime, not at module load time
        const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
        console.log('Runtime Mistral API Key check:', MISTRAL_API_KEY ? 'Yes (length: ' + MISTRAL_API_KEY.length + ')' : 'No');

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: 'Message is required' });
        }

        let chatSession;

        // Get or create chat session
        if (sessionId) {
            chatSession = await ChatSession.findOne({ 
                _id: sessionId, 
                userId: userId,
                isActive: true 
            });
            
            if (!chatSession) {
                return res.status(404).json({ message: 'Chat session not found' });
            }
        } else {
            // Create new chat session
            chatSession = new ChatSession({
                userId: userId,
                messages: [],
                title: 'New Chat'
            });
        }

        // Add user message to session
        await chatSession.addMessage('user', message.trim());

        let aiResponse = 'I apologize, but I\'m currently unable to process your request. Please try again later.';

        try {
            // Call Mistral API
            if (MISTRAL_API_KEY && MISTRAL_API_KEY.trim() !== '' && MISTRAL_API_KEY !== 'your_mistral_api_key_here') {
                console.log('Making Mistral API request...');
                const mistralResponse = await axios.post(
                    MISTRAL_API_URL,
                    {
                        model: 'mistral-medium',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a helpful AI assistant. Provide helpful, accurate, and concise responses.'
                            },
                            ...chatSession.messages.slice(-10).map(msg => ({
                                role: msg.role === 'assistant' ? 'assistant' : 'user',
                                content: msg.content
                            }))
                        ],
                        max_tokens: 1000,
                        temperature: 0.7
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                );

                if (mistralResponse.data.choices && mistralResponse.data.choices[0]) {
                    aiResponse = mistralResponse.data.choices[0].message.content;
                    console.log('Mistral API response received successfully');
                }
            } else {
                console.log('Mistral API key not configured or invalid');
                // Fallback response when no API key is provided
                aiResponse = `Thank you for your message: "${message}". I'm a demo YUG-AI. To get real AI responses, please configure your Mistral API key in the server environment variables.`;
            }
        } catch (apiError) {
            console.error('Mistral API Error:', apiError.response?.data || apiError.message);
            
            // Provide a helpful fallback response
            aiResponse = `I understand you're asking about: "${message}". I'm currently experiencing some technical difficulties connecting to my AI service. Please try again in a moment, or rephrase your question.`;
        }

        // Add AI response to session
        await chatSession.addMessage('assistant', aiResponse, {
            model: 'mistral-medium',
            timestamp: new Date()
        });

        res.json({
            success: true,
            aiMessage: aiResponse,
            sessionId: chatSession._id,
            messageCount: chatSession.messages.length
        });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ 
            message: 'Failed to process chat message',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get chat history for the current user
exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const skip = parseInt(req.query.skip) || 0;

        const sessions = await ChatSession.getUserSessions(userId, limit + skip);
        const paginatedSessions = sessions.slice(skip, skip + limit);

        res.json({
            success: true,
            sessions: paginatedSessions,
            total: sessions.length,
            hasMore: sessions.length > skip + limit
        });

    } catch (error) {
        console.error('Get Chat History Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve chat history',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get a specific chat session
exports.getChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await ChatSession.findOne({
            _id: sessionId,
            userId: userId,
            isActive: true
        }).populate('userId', 'name email');

        if (!session) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        res.json({
            success: true,
            session
        });

    } catch (error) {
        console.error('Get Chat Session Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve chat session',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete a chat session
exports.deleteChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await ChatSession.findOne({
            _id: sessionId,
            userId: userId
        });

        if (!session) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        // Soft delete by setting isActive to false
        session.isActive = false;
        await session.save();

        res.json({
            success: true,
            message: 'Chat session deleted successfully'
        });

    } catch (error) {
        console.error('Delete Chat Session Error:', error);
        res.status(500).json({ 
            message: 'Failed to delete chat session',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update chat session title
exports.updateChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { title } = req.body;
        const userId = req.user.id;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const session = await ChatSession.findOne({
            _id: sessionId,
            userId: userId,
            isActive: true
        });

        if (!session) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        session.title = title.trim();
        await session.save();

        res.json({
            success: true,
            message: 'Chat session updated successfully',
            session
        });

    } catch (error) {
        console.error('Update Chat Session Error:', error);
        res.status(500).json({ 
            message: 'Failed to update chat session',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
