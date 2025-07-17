import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaRobot } from 'react-icons/fa';
import { authAPI } from '../services/api'; // <- Your Axios wrapper
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(location.state?.message || null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (location.state?.message) {
      setStatusMessage(location.state.message);
      window.history.replaceState({}, document.title); // clear message from history
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password && !otpSent) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await authAPI.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      // OTP sent if credentials were valid
      if (res.message === 'OTP sent to your email') {
        setOtpSent(true);
        setStatusMessage('OTP sent to your email');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await authAPI.verifyOtp({
        email: formData.email.trim().toLowerCase(),
        otp
      });

      login(res.token, res.user);
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid or expired OTP';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={5} xl={4}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div
                  className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '60px', height: '60px' }}
                >
                  <FaRobot className="text-white" size={24} />
                </div>
                <h2 className="fw-bold text-dark">Welcome Back</h2>
                <p className="text-muted">Sign in to your AI Chat account</p>
              </div>

              {statusMessage && (
                <Alert variant="info" className="mb-4">
                  {statusMessage}
                </Alert>
              )}

              {errorMessage && (
                <Alert variant="danger" className="mb-4">
                  {errorMessage}
                </Alert>
              )}

              <Form onSubmit={otpSent ? handleOtpVerify : handleSubmit}>
                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <FaEnvelope className="me-2" /> Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    isInvalid={!!errors.email}
                    disabled={otpSent}
                    className="py-2"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password */}
                {!otpSent && (
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <FaLock className="me-2" /> Password
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        isInvalid={!!errors.password}
                        className="py-2 pe-5"
                      />
                      <Button
                        variant="link"
                        className="position-absolute top-50 end-0 translate-middle-y border-0 text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                {/* OTP */}
                {otpSent && (
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <FaLock className="me-2" /> Enter OTP
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="py-2"
                      maxLength={6}
                    />
                  </Form.Group>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 fw-semibold py-2 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {otpSent ? 'Verifying OTP...' : 'Signing In...'}
                    </>
                  ) : (
                    otpSent ? 'Verify OTP' : 'Sign In'
                  )}
                </Button>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0 text-muted">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary fw-semibold text-decoration-none">
                    Create Account
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
