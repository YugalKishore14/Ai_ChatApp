import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaRobot,
  FaPaperPlane,
  FaSignOutAlt,
  FaCog,
  FaTrash,
  FaPlus,
  FaBrain,
  FaBars,
} from "react-icons/fa";
import { BsFillSendFill } from "react-icons/bs";


import { useAuth } from "../context/AuthContext";
import { chatAPI } from "../services/api";
import MarkdownRenderer from "../components/MarkdownRenderer";
import "./Chat.css";

const Chat = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [notification, setNotification] = useState(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const isMobile = () => window.innerWidth <= 768;

  useEffect(() => {
    loadChatHistory();
    inputRef.current?.focus();
    document.body.classList.add("chat-active");

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
        setSidebarCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      document.body.classList.remove("chat-active");
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getChatHistory();
      setChatHistory(response.sessions || []);
    } catch (error) {
      showNotification("Failed to load chat history", "error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setIsTyping(false);
    setLoading(false);
    if (isMobile()) setSidebarVisible(false);
    inputRef.current?.focus();
  };

  const loadChatSession = (session) => {
    setMessages(session.messages || []);
    setCurrentSessionId(session._id);
    setIsTyping(false);
    setLoading(false);
    if (isMobile()) setSidebarVisible(false);
  };

  const toggleSidebar = (e) => {
    e.stopPropagation();
    if (isMobile()) {
      setSidebarVisible((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isMobile() && sidebarVisible && !e.target.closest(".chat-sidebar") && !e.target.closest(".nav-btn")) {
        setSidebarVisible(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [sidebarVisible]);

  const deleteChatSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteChatSession(sessionId);
      setChatHistory((prev) => prev.filter((s) => s._id !== sessionId));
      if (currentSessionId === sessionId) {
        startNewChat();
      }
      showNotification("Chat session deleted", "success");
    } catch (error) {
      showNotification("Failed to delete chat session", "error");
    }
  };

  const simulateStreaming = (text, callback) => {
    const words = text.split(" ");
    let currentText = "";
    let wordIndex = 0;
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex > 0 ? " " : "") + words[wordIndex];
        callback(currentText);
        wordIndex++;
      } else {
        clearInterval(interval);
        setLoading(false);
      }
    }, 80);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    scrollToTop();
    setInput("");

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.rows = 1;
    }

    setLoading(true);

    const aiMessagePlaceholder = {
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, aiMessagePlaceholder]);

    try {
      const response = await chatAPI.sendMessage(
        userMessage.content,
        currentSessionId
      );
      if (response.success) {
        setCurrentSessionId(response.sessionId);
        loadChatHistory();
        simulateStreaming(response.aiMessage, (streamedText) => {
          setMessages((prev) =>
            prev.map((msg, index) =>
              index === prev.length - 1
                ? {
                  ...msg,
                  content: streamedText,
                  isStreaming: streamedText !== response.aiMessage,
                }
                : msg
            )
          );
        });
      } else {
        setMessages((prev) => prev.slice(0, -1));
        showNotification("Failed to get AI response", "error");
      }
    } catch (error) {
      setMessages((prev) => prev.slice(0, -1));
      showNotification("Failed to send message. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.style.pointerEvents = "auto";
    }
  }, []);

  return (
    <div className="chat-app">
      {/* Header */}
      <header className="chat-header">
        <div className="header-left">
          <button className="nav-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
          <Link to="/dashboard" className="header-logo-link">
            <div className="header-logo">
              <FaBrain className="logo-pulse" />
              <span className="header-title">YUG-AI</span>
            </div>
          </Link>
        </div>
        <div className="header-right">
          <div className="user-status">
            <div className="status-indicator online"></div>
            <span className="user-name">{user?.name}</span>
          </div>
          {isAdmin() && (
            <button className="action-btn admin-btn" onClick={() => navigate("/admin")}>
              <FaCog />
              <span className="admin-btn-text">Admin</span>
            </button>
          )}
          <button className="action-btn logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <div className="chat-container">
        <div className={`chat-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${sidebarVisible ? "show" : ""}`}>
          <div className="sidebar-header">
            <button className="new-chat-btn" onClick={startNewChat}>
              <FaPlus />
              New Chat
            </button>
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
                  className={`chat-session-item ${currentSessionId === session._id ? "active" : ""}`}
                  onClick={() => loadChatSession(session)}
                >
                  <div className="session-title">{session.title}</div>
                  <div className="session-meta">
                    <span className="session-time">
                      {new Date(
                        session.lastActivity || session.createdAt
                      ).toLocaleDateString()}
                    </span>
                    <button
                      className="delete-session"
                      onClick={(e) => deleteChatSession(session._id, e)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat */}
        <div className="chat-main">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-chat-content">
                  <FaBrain className="empty-chat-icon" />
                  <h3>Ready to chat?</h3>
                  <p>Start a conversation with our YUG-AI. Ask anything!</p>
                  <div className="suggested-prompts">
                    <button onClick={() => setInput("What can you help me with?")}>
                      What can you help me with?
                    </button>
                    <button onClick={() => setInput("Tell me a joke")}>
                      Tell me a joke
                    </button>
                    <button onClick={() => setInput("Explain quantum computing")}>
                      Explain quantum computing
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="messages-list" ref={chatContainerRef}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message-wrapper ${message.role}`}
                  >
                    <div className="message-avatar">
                      {message.role === "user" ? (
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
                      <div className={`message-header ${message.role}`}>
                        <span className="message-sender">
                          {message.role === "user" ? user?.name : "YUG-AI"}
                        </span>
                      </div>
                      <div className={`message-bubble ${message.role}`}>
                        {message.role === "assistant" ? (
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
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="chat-input-container">
            <form className="chat-form" onSubmit={handleSend}>
              <div className="chat-input-group">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask anything"
                  disabled={loading}
                  className="chat-input"
                  rows="1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                ></textarea>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className={`send-btn ${loading ? "loading" : ""}`}
                  onClick={handleSend}
                >
                  <BsFillSendFill />
                </button>
              </div>
              <div className="input-footer">
                <span className="input-hint">
                  Press Enter to send, Shift + Enter for new line
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;