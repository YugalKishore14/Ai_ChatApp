import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Navbar, Nav, Badge, Spinner, InputGroup } from 'react-bootstrap';
import { FaRobot, FaUser, FaPaperPlane, FaSignOutAlt, FaCog, FaTrash, FaPlus, FaHome, FaBrain, FaMicrophone, FaStop } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Chat = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [notification, setNotification] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    inputRef.current?.focus();
    
    // Add chat-active class to body to prevent scrolling
    document.body.classList.add('chat-active');
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('chat-active');
    };
  }, []);

  // Only scroll when a new message is added, not on every update
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getChatHistory();
      setChatHistory(response.sessions || []);
    } catch (error) {
      showNotification('Failed to load chat history', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setIsTyping(false);
    setLoading(false);
    inputRef.current?.focus();
  };

  const loadChatSession = (session) => {
    setMessages(session.messages || []);
    setCurrentSessionId(session._id);
    setIsTyping(false);
    setLoading(false);
  };

  const deleteChatSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteChatSession(sessionId);
      setChatHistory(prev => prev.filter(s => s._id !== sessionId));
      if (currentSessionId === sessionId) {
        startNewChat();
      }
      showNotification('Chat session deleted', 'success');
    } catch (error) {
      showNotification('Failed to delete chat session', 'error');
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
        setLoading(false); // Reset loading when done
      }
    }, 80);
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

    // Add an empty AI message that will be filled gradually
    const aiMessagePlaceholder = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    };
    setMessages(prev => [...prev, aiMessagePlaceholder]);

    try {
      const response = await chatAPI.sendMessage(userMessage.content, currentSessionId);
      
      if (response.success) {
        setCurrentSessionId(response.sessionId);
        loadChatHistory();

        // Simulate streaming for the AI response without typing indicator
        simulateStreaming(response.aiMessage, (streamedText) => {
          setMessages(prev => prev.map((msg, index) => 
            index === prev.length - 1 ? { ...msg, content: streamedText, isStreaming: streamedText !== response.aiMessage } : msg
          ));
        });
      } else {
        setMessages(prev => prev.slice(0, -1));
        showNotification('Failed to get AI response', 'error');
      }
    } catch (error) {
      setMessages(prev => prev.slice(0, -1)); // Remove placeholder
      showNotification('Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-app">
      {/* Custom Notification */}
      {notification && (
        <div className={`custom-notification ${notification.type}`}>
          <div className="notification-content">
            {notification.message}
          </div>
        </div>
      )}

      {/* Modern Header */}
      <header className="chat-header">
        <Container fluid>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                <Button 
                  variant="link" 
                  className="nav-btn"
                  onClick={() => navigate('/dashboard')}
                >
                  <FaHome />
                </Button>
                <div className="header-logo">
                  <FaBrain className="logo-pulse" />
                  <span className="header-title">YUG-AI</span>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div className="header-actions">
                <div className="user-status">
                  <div className="status-indicator online"></div>
                  <span className="user-name">{user?.name}</span>
                </div>
                {isAdmin() && (
                  <Button className="action-btn admin-btn" onClick={() => navigate('/admin')}>
                    <FaCog />
                    <span>Admin</span>
                  </Button>
                )}
                <Button className="action-btn logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt />
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </header>

      <div className="chat-container">
        {/* Enhanced Sidebar */}
        <div className={`chat-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <Button 
              className="new-chat-btn w-100"
              onClick={startNewChat}
            >
              <FaPlus />
              New Conversation
            </Button>
          </div>

          <div className="chat-history">
            <div className="history-title">Recent Chats</div>
            {chatHistory.length === 0 ? (
              <div className="empty-history">
                <FaRobot className="empty-icon" />
                <p>No conversations yet</p>
              </div>
            ) : (
              chatHistory.map((session) => (
                <div
                  key={session._id}
                  className={`chat-session-item ${currentSessionId === session._id ? 'active' : ''}`}
                  onClick={() => loadChatSession(session)}
                >
                  <div className="session-title">{session.title}</div>
                  <div className="session-meta">
                    <span className="session-time">
                      {new Date(session.lastActivity || session.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="link"
                      size="sm"
                      className="delete-session"
                      onClick={(e) => deleteChatSession(session._id, e)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-chat-content">
                  <FaBrain className="empty-chat-icon" />
                  <h3>Ready to chat?</h3>
                  <p>Start a conversation with our YUG-AI. Ask anything!</p>
                  <div className="suggested-prompts">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => setInput("What can you help me with?")}
                    >
                      What can you help me with?
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => setInput("Tell me a joke")}
                    >
                      Tell me a joke
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => setInput("Explain quantum computing")}
                    >
                      Explain quantum computing
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((message, index) => (
                  <div key={index} className={`message-wrapper ${message.role}`}>
                    <div className="message-avatar">
                      {message.role === 'user' ? (
                        <div className="user-avatar">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="ai-avatar">
                          <FaBrain />
                        </div>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">
                          {message.role === 'user' ? user?.name : 'YUG-AI'}
                        </span>
                        <span className="message-time">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className={`message-bubble ${message.role}`}>
                        {message.role === 'assistant' ? (
                          <MarkdownRenderer content={message.content} />
                        ) : (
                          message.content
                        )}
                        {message.isStreaming && (
                          <span className="cursor-blink">|</span>
                        )}
                      </div>
                    </div>
                  </div>
                )                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Enhanced Input Area */}
          <div className="chat-input-container">
            <Form onSubmit={handleSend} className="chat-form">
              <InputGroup className="chat-input-group">
                <Form.Control
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message here..."
                  disabled={loading}
                  className="chat-input"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="send-btn"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <FaPaperPlane />
                  )}
                </Button>
              </InputGroup>
            </Form>
            <div className="input-footer">
              <span className="input-hint">
                Press Enter to send, Shift + Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
