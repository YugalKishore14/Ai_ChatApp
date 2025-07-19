import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Tabs,
  Tab,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaUsers,
  FaComments,
  FaDownload,
  FaTrash,
  FaEdit,
  FaEye,
  FaUserShield,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBrain,
  FaHome,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [notification, setNotification] = useState(null);

  // Custom notification function
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResponse, pendingResponse, chatResponse] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getPendingUsers(),
        adminAPI.getAllChatHistory(),
      ]);
      setUsers(usersResponse.users || []);
      setPendingUsers(pendingResponse.users || []);
      setChatHistory(chatResponse.chats || []);
    } catch (error) {
      showNotification("Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await adminAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      showNotification("User deleted successfully", "success");
    } catch (error) {
      showNotification("Failed to delete user", "error");
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await adminAPI.updateUser(selectedUser._id, userData);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === selectedUser._id ? { ...user, ...userData } : user
        )
      );
      setShowUserModal(false);
      setSelectedUser(null);
      toast.success("User updated successfully");
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      setPendingUsers((prev) => prev.filter((user) => user._id !== userId));
      // Refresh the approved users list
      loadData();
      showNotification("User approved successfully", "success");
    } catch (error) {
      showNotification("Failed to approve user", "error");
    }
  };

  const handleRejectUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to reject this user registration? This action cannot be undone."
      )
    )
      return;

    try {
      await adminAPI.rejectUser(userId);
      setPendingUsers((prev) => prev.filter((user) => user._id !== userId));
      showNotification("User registration rejected", "success");
    } catch (error) {
      showNotification("Failed to reject user", "error");
    }
  };

  const handleExportChats = async () => {
    try {
      const blob = await adminAPI.exportChatData();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chat-export-${new Date().toISOString().split("T")[0]
        }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification("Chat data exported successfully", "success");
    } catch (error) {
      showNotification("Failed to export chat data", "error");
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const openChatModal = (chat) => {
    setSelectedChat(chat);
    setShowChatModal(true);
  };

  const UserModal = () => (
    <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedUser && (
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdateUser({
                name: formData.get("name"),
                email: formData.get("email"),
                role: formData.get("role"),
              });
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                defaultValue={selectedUser.name}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                defaultValue={selectedUser.email}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" defaultValue={selectedUser.role}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowUserModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update User
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );

  const ChatModal = () => (
    <Modal
      show={showChatModal}
      onHide={() => setShowChatModal(false)}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Chat Session Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedChat && (
          <div>
            <div className="mb-3">
              <strong>User:</strong> {selectedChat.userId?.name || "Unknown"} (
              {selectedChat.userId?.email || "N/A"})
            </div>
            <div className="mb-3">
              <strong>Created:</strong>{" "}
              {new Date(selectedChat.createdAt).toLocaleString()}
            </div>
            <div className="mb-3">
              <strong>Last Updated:</strong>{" "}
              {new Date(selectedChat.updatedAt).toLocaleString()}
            </div>
            <hr />
            <h6>Messages:</h6>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {selectedChat.messages?.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded ${message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-light"
                    }`}
                >
                  <div className="fw-bold">
                    {message.role === "user" ? "User" : "AI"}:
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {message.content}
                  </div>
                  {message.timestamp && (
                    <small
                      className={
                        message.role === "user" ? "text-light" : "text-muted"
                      }
                    >
                      {new Date(message.timestamp).toLocaleString()}
                    </small>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <>
      {/* Custom Notification */}
      {notification && (
        <div
          className={`custom-notification custom-notification-${notification.type}`}
        >
          <div className="d-flex align-items-center">
            {notification.type === "success" ? (
              <FaCheckCircle className="me-2" />
            ) : (
              <FaExclamationTriangle className="me-2" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Modern Header */}
      <header className="admin-header">
        <Container fluid>
          <Row className="align-items-center py-3">
            <Col>
              <div className="d-flex align-items-center">
                <div className="logo-container">
                  <FaBrain className="logo-icon" />
                </div>
                <div className="ms-3">
                  <h4 className="mb-0 brand-text">Admin Panel</h4>
                  <small
                    className="header-text"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    System Management
                  </small>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center gap-3 dashbord-button">
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="user-name">{user?.name}</div>
                    <div className="user-role">Administrator</div>
                  </div>
                </div>
                <Button
                  variant="outline-primary"
                  className="modern-btn"
                  onClick={() => navigate("/dashboard")}
                >
                  <FaHome className="me-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline-secondary"
                  className="logout-btn"
                  id="logout-button"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <FaArrowLeft className="logout" />
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </header>

      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0 admin-panel-title">
                  <FaUserShield className="me-2 text-primary" />
                  Admin Panel
                </h2>
                <p className="text-muted mb-0 header-text-p">
                  Manage users and monitor chat activity
                </p>
              </div>
              <Button
                className="back-to-chat-btn"
                variant="outline-primary"
                onClick={() => navigate("/chat")}
              >
                <FaArrowLeft className="me-2" />
                Back to Chat
              </Button>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={6} lg={3} className="box-4">
            <Card className="text-center h-100">
              <Card.Body>
                <FaUsers size={40} className="text-primary mb-2" />
                <h4 className="mb-0">{users.length}</h4>
                <p className="text-muted mb-0">Total Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3} className="box-4">
            <Card className="text-center h-100">
              <Card.Body>
                <FaComments size={40} className="text-success mb-2" />
                <h4 className="mb-0">{chatHistory.length}</h4>
                <p className="text-muted mb-0">Chat Sessions</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3} className="box-4">
            <Card className="text-center h-100">
              <Card.Body>
                <FaUserShield size={40} className="text-warning mb-2" />
                <h4 className="mb-0">
                  {users.filter((u) => u.role === "admin").length}
                </h4>
                <p className="text-muted mb-0">Admins</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3} className="box-4">
            <Card className="text-center h-100">
              <Card.Body>
                <FaDownload size={40} className="text-info mb-2" />
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={handleExportChats}
                >
                  Export Data
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card>
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(tab) => setActiveTab(tab)}
              className="mb-3"
            >
              {/* Pending Users Tab */}
              <Tab
                eventKey="pending"
                title={
                  <span>
                    Pending Approval
                    {pendingUsers.length > 0 && (
                      <Badge bg="warning" className="ms-2">
                        {pendingUsers.length}
                      </Badge>
                    )}
                  </span>
                }
              >
                {pendingUsers.length === 0 ? (
                  <Alert variant="info">
                    <i className="fas fa-info-circle me-2"></i>
                    No users pending approval
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Registration Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingUsers.map((user) => (
                          <tr key={user._id}>
                            <td>
                              <strong>{user.name}</strong>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() => handleApproveUser(user._id)}
                              >
                                <i className="fas fa-check me-1"></i>
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRejectUser(user._id)}
                              >
                                <i className="fas fa-times me-1"></i>
                                Reject
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab>

              {/* Users Tab */}
              <Tab eventKey="users" title="Users Management">
                <div
                  className="table-responsive"
                  style={{
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <Table
                    striped
                    hover
                    className="table-sm text-nowrap"
                    style={{ minWidth: "600px" }}
                  >
                    <thead className="table-light">
                      <tr style={{ fontSize: "14px" }}>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} style={{ fontSize: "13px" }}>
                          <td>
                            <strong>{user.name}</strong>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <Badge
                              bg={
                                user.role === "admin" ? "primary" : "secondary"
                              }
                              className="px-2 py-1"
                              style={{ fontSize: "11px" }}
                            >
                              {user.role}
                            </Badge>
                          </td>
                          <td>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                            >
                              <FaEdit />
                            </Button>
                            <Button variant="outline-danger" size="sm">
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Tab>

              {/* Chat History Tab */}
              <Tab eventKey="chats" title="Chat History">
                <div
                  className="table-responsive"
                  style={{
                    overflowX: "auto",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <Table
                    striped
                    hover
                    className="table-sm text-nowrap"
                    style={{ minWidth: "600px" }}
                  >
                    <thead className="table-light">
                      <tr style={{ fontSize: "14px" }}>
                        <th>User</th>
                        <th>Messages</th>
                        <th>Created</th>
                        <th>Last Activity</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chatHistory.map((chat) => (
                        <tr key={chat._id} style={{ fontSize: "13px" }}>
                          <td>
                            <strong>
                              {chat.userId?.name || "Unknown User"}
                            </strong>
                            <br />
                            <small className="text-muted">
                              {chat.userId?.email || "N/A"}
                            </small>
                          </td>
                          <td>
                            <Badge
                              bg="info"
                              className="px-2 py-1"
                              style={{ fontSize: "11px" }}
                            >
                              {chat.messages?.length || 0} messages
                            </Badge>
                          </td>
                          <td>
                            {new Date(chat.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="px-2 py-1"
                              onClick={() => openChatModal(chat)}
                            >
                              <FaEye />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>

        {/* Modals */}
        <UserModal />
        <ChatModal />
      </Container>
    </>
  );
};

export default AdminPanel;
