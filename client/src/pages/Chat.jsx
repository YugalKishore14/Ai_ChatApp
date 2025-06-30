import React, { useState } from 'react';
import axios from 'axios';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSend = async (e) => {
        e.preventDefault();
        setError('');
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:4000/api/chat', // 🔥 FIXED URL HERE
                { message: input },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const aiMessage = { role: 'ai', content: res.data.aiMessage };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            setError(err.response?.data?.error || 'Error communicating with AI');
        }

        setInput('');
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
            <h2>Chat with AI</h2>
            <div style={{ border: '1px solid #ccc', padding: 10, minHeight: 200, marginBottom: 10 }}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            textAlign: msg.role === 'user' ? 'right' : 'left',
                            margin: '8px 0',
                        }}
                    >
                        <b>{msg.role === 'user' ? 'You' : 'AI'}:</b> {msg.content}
                    </div>
                ))}
                {loading && <div>AI is typing...</div>}
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    style={{ flex: 1 }}
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()}>
                    Send
                </button>
            </form>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </div>
    );
};

export default Chat;
