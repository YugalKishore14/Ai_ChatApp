import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaRobot, FaComments, FaUserShield, FaSignOutAlt, FaStar, FaBrain } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-vh-100 dashboard-bg">
      {/* Modern Header */}
      <header className="dashboard-header">
        <Container fluid>
          <Row className="align-items-center py-3">
            <Col>
              <div className="d-flex align-items-center">
                <div className="logo-container">
                  <FaBrain className="logo-icon" />
                </div>
                <div className="ms-3">
                  <h4 className="mb-0 brand-text">YUG-AI</h4>
                  <small className="text-muted">Powered by YUG-AI Technology</small>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center gap-3">
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ms-3">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-role">{user?.role === 'admin' ? 'Administrator' : 'User'}</div>
                  </div>
                </div>
                <Button 
                  variant="outline-secondary" 
                  className="modern-btn logout-btn"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                </Button>
              </div>
            </Col>
          </Row>
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
                Ready to explore the power of YUG-AI? Choose what you'd like to do today.
              </p>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={4} md={6} className="mb-4">
            <Card className="feature-card h-100" onClick={() => navigate('/chat')}>
              <Card.Body className="text-center p-4">
                <div className="feature-icon-container mb-3">
                  <FaComments className="feature-icon" />
                </div>
                <h5 className="feature-title">Start Chatting</h5>
                <p className="feature-description">
                  Engage in intelligent conversations with our advanced YUG-AI
                </p>
                <Button className="modern-btn primary-btn w-100">
                  Begin Conversation
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {isAdmin() && (
            <Col lg={4} md={6} className="mb-4">
              <Card className="feature-card admin-card h-100" onClick={() => navigate('/admin')}>
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
    </div>
  );
};

export default Dashboard;
