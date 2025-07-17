import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
  FaRobot,
  FaComments,
  FaUserShield,
  FaSignOutAlt,
  FaStar,
  FaBrain,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-vh-100 dashboard-bg">
      {/* Modern Header */}
      <header>
        <Container fluid>
          {/* === DESKTOP HEADER === */}
          <Row
            className="align-items-center justify-content-between py-3 px-3 d-none d-md-flex"
            style={{
              background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
              color: "#fff",
              // borderRadius: "0 0 1rem 1rem",
            }}
          >
            <Col md="auto" className="d-flex align-items-center">
              <FaBrain
                style={{
                  fontSize: "2rem",
                  color: "#fff",
                  marginRight: "0.75rem",
                }}
              />
              <div>
                <h4 style={{ marginBottom: "0", fontWeight: "bold" }}>
                  YUG-AI
                </h4>
                <small style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  Powered by YUG-AI Technology
                </small>
              </div>
            </Col>

            <Col md="auto" className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    backgroundColor: "#6c757d",
                    color: "#fff",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: "500" }}>{user?.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "#ddd" }}>
                    {user?.role === "admin" ? "Administrator" : "User"}
                  </div>
                </div>
              </div>
              <Button
                variant="link"
                onClick={handleLogout}
                title="Logout"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  background: isHovered ? 'rgb(239, 68, 68)' : 'rgba(235, 220, 220, 0.1)',
                  color: isHovered ? 'white' : 'rgb(239, 68, 68)',
                  border: isHovered
                    ? '1px solid rgb(239, 68, 68)'
                    : '1px solid rgba(230, 28, 28, 0.2)',
                  borderRadius: '50%',
                  width: '3.5rem',
                  height: '3.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
              >
                <FaSignOutAlt />
              </Button>

            </Col>
          </Row>

          {/* === MOBILE HEADER === */}
          <div
            className="d-block d-md-none text-center py-4"
            style={{
              background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
              color: "#fff",
              borderRadius: "0 0 1rem 1rem",
            }}
          >
            <FaBrain style={{ fontSize: "2rem", marginBottom: "0.5rem" }} />
            <h4 style={{ marginBottom: "0.25rem", fontWeight: "bold" }}>
              YUG-AI
            </h4>
            <small style={{ color: "rgba(255, 255, 255, 0.8)" }}>
              Powered by YUG-AI Technology
            </small>

            <div className="d-flex align-items-center justify-content-center gap-3 mt-3">
              <div
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 500 }}>{user?.name}</div>
                <div style={{ fontSize: "0.85rem", color: "#ccc" }}>
                  {user?.role === "admin" ? "Administrator" : "User"}
                </div>
              </div>
              <Button
                variant="link"
                onClick={handleLogout}
                title="Logout"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  background: isHovered ? 'rgb(239, 68, 68)' : 'rgba(235, 220, 220, 0.1)',
                  color: isHovered ? 'white' : 'rgb(239, 68, 68)',
                  border: isHovered
                    ? '1px solid rgb(239, 68, 68)'
                    : '1px solid rgba(230, 28, 28, 0.2)',
                  borderRadius: '50%',
                  width: '3rem',
                  height: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                }}
              >
                <FaSignOutAlt />
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <div className="welcome-section">
              <FaStar className="welcome-icon mb-3" />
              <h1 className="welcome-title">Welcome back, {user?.name}!</h1>
              <p className="welcome-subtitle">
                Ready to explore the power of YUG-AI? Choose what you'd like to
                do today.
              </p>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={4} md={6} className="mb-4">
            <Card
              className="feature-card h-100"
              onClick={() => navigate("/chat")}
            >
              <Card.Body className="text-center p-4">
                <div className="feature-icon-container mb-3">
                  <FaComments className="feature-icon" />
                </div>
                <h5 className="feature-title">Start Chatting</h5>
                <p className="feature-description">
                  Engage in intelligent conversations with our advanced YUG-AI
                </p>
                <Button
                  className="modern-btn primary-btn w-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/chat");
                  }}
                >
                  Begin Conversation
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {isAdmin() && (
            <Col lg={4} md={6} className="mb-4">
              <Card
                className="feature-card admin-card h-100"
                onClick={() => navigate("/admin")}
              >
                <Card.Body className="text-center p-4">
                  <div className="feature-icon-container mb-3">
                    <FaUserShield className="feature-icon" />
                  </div>
                  <h5 className="feature-title">Admin Panel</h5>
                  <p className="feature-description">
                    Manage users, monitor conversations, and system settings
                  </p>
                  <Button className="modern-btn admin-btn w-100">
                    Access Panel
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        {/* Stats Section */}
        <Row className="mt-5">
          <Col>
            <Card className="stats-card">
              <Card.Body className="p-4">
                <Row className="text-center">
                  <Col md={4}>
                    <div className="stat-item">
                      <div className="stat-number">24/7</div>
                      <div className="stat-label">Available</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="stat-item">
                      <div className="stat-number">∞</div>
                      <div className="stat-label">Possibilities</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="stat-item">
                      <div className="stat-number">AI</div>
                      <div className="stat-label">Powered</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div >
  );
};

export default Dashboard;
