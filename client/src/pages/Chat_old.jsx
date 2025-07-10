import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Navbar, Nav, Dropdown, Badge, Spinner, InputGroup } from 'react-bootstrap';
import { FaRobot, FaUser, FaPaperPlane, FaSignOutAlt, FaCog, FaTrash, FaPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { toast } from 'react-toastify';

const Chat = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getChatHistory();
      setChatHistory(response.sessions || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    inputRef.current?.focus();
  };

  const loadChatSession = (session) => {
    setMessages(session.messages || []);
    setCurrentSessionId(session._id);
  };

  const deleteChatSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteChatSession(sessionId);
      setChatHistory(prev => prev.filter(s => s._id !== sessionId));
      if (currentSessionId === sessionId) {
        startNewChat();
      }
      toast.success('Chat session deleted');
    } catch (error) {
      toast.error('Failed to delete chat session');
    }
  };

  const simulateStreaming = (text, callback) => {
    const words = text.split(' ');
    let currentText = '';
    let wordIndex = 0;
    
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
        callback(currentText);
        wordIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 100); // Adjust speed as needed
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await chatAPI.sendMessage(input.trim(), currentSessionId);
      
      // Add AI message placeholder
      const aiMessageId = Date.now();
      const aiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // Simulate streaming response
      simulateStreaming(response.aiMessage, (streamedText) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: streamedText }
              : msg
          )
        );
      });

      // Update session ID if new chat
      if (response.sessionId && !currentSessionId) {
        setCurrentSessionId(response.sessionId);
        loadChatHistory(); // Refresh sidebar
      }

    } catch (error) {
      setIsTyping(false);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="d-flex flex-column vh-100">
      {/* Navigation Bar */}
      <Navbar bg="primary" variant="dark" className="px-3">
        <Navbar.Brand>
          <FaRobot className="me-2" />
          AI Chat Assistant
        </Navbar.Brand>
        <Nav className="ms-auto align-items-center">
          <Nav.Item className="me-3">
            <span className="text-white">Welcome, {user?.name}!</span>
          </Nav.Item>
          {isAdmin() && (
            <Nav.Item className="me-3">
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <FaCog className="me-1" />
                Admin Panel
              </Button>
            </Nav.Item>
          )}
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-light" size="sm">
              <FaUser />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar>

      <div className="flex-grow-1 d-flex">
        {/* Sidebar */}
        <div className="bg-light border-end" style={{ width: '280px', overflowY: 'auto' }}>
          <div className="p-3">
            <Button 
              variant="primary" 
              className="w-100 mb-3"
              onClick={startNewChat}
            >
              <FaPlus className="me-2" />
              New Chat
            </Button>
            
            <h6 className="text-muted mb-3">Recent Chats</h6>
            
            {chatHistory.map((session) => (
              <Card 
                key={session._id}
                className={`mb-2 cursor-pointer ${currentSessionId === session._id ? 'border-primary' : ''}`}
                onClick={() => loadChatSession(session)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="p-2 d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <div className="text-truncate" style={{ fontSize: '0.9rem' }}>
                      {session.title || 'New Chat'}
                    </div>
                    <small className="text-muted">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </small>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => deleteChatSession(session._id, e)}
                    className="ms-2"
                  >
                    <FaTrash size={12} />
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-grow-1 d-flex flex-column">
          {/* Messages Area */}
          <div className="flex-grow-1 p-3" style={{ overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
            {messages.length === 0 ? (
              <div className="text-center h-100 d-flex flex-column justify-content-center">
                <FaRobot size={64} className="text-primary mb-4" />
                <h4 className="text-muted">Start a conversation</h4>
                <p className="text-muted">Ask me anything and I'll help you out!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`d-flex mb-3 ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div className={`d-flex align-items-start ${message.role === 'user' ? 'flex-row-reverse' : ''}`} style={{ maxWidth: '70%' }}>
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${message.role === 'user' ? 'ms-2 bg-primary' : 'me-2 bg-success'}`} 
                         style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                      {message.role === 'user' ? (
                        <FaUser className="text-white" size={16} />
                      ) : (
                        <FaRobot className="text-white" size={16} />
                      )}
                    </div>
                    <div className={`rounded-3 p-3 ${message.role === 'user' ? 'bg-primary text-white' : 'bg-white border'}`}>
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                        {message.isStreaming && isTyping && (
                          <span className="ms-1">
                            <Spinner animation="grow" size="sm" />
                          </span>
                        )}
                      </div>
                      {message.timestamp && (
                        <small className={`d-block mt-1 ${message.role === 'user' ? 'text-light' : 'text-muted'}`}>
                          {formatTime(message.timestamp)}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="d-flex justify-content-start mb-3">
                <div className="d-flex align-items-start">
                  <div className="rounded-circle d-flex align-items-center justify-content-center bg-success me-2" 
                       style={{ width: '40px', height: '40px' }}>
                    <FaRobot className="text-white" size={16} />
                  </div>
                  <div className="bg-white border rounded-3 p-3">
                    <div className="d-flex align-items-center">
                      <span className="me-2">AI is typing</span>
                      <Spinner animation="grow" size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-top bg-white p-3">
            <Form onSubmit={handleSend}>
              <InputGroup>
                <Form.Control
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="py-2"
                />
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <FaPaperPlane />
                  )}
                </Button>
              </InputGroup>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
