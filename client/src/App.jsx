import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Chat from './pages/Chat';
import AdminPanel from './pages/AdminPanel';
import OtpVerification from './components/OtpVerification';
import { FaBrain } from 'react-icons/fa';

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#6366f1',
        color: 'white',
        fontSize: '2rem'
      }}>
        Loading YUG-AI Assistant...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated() ?
            <Navigate to="/dashboard" replace /> :
            <Navigate to="/login" replace />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated() ?
            <Navigate to="/dashboard" replace /> :
            <Signup />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated() ?
            <Navigate to="/dashboard" replace /> :
            <Login />
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* ✅ OTP Verification Route */}
      <Route
        path="/verify-otp"
        element={<OtpVerification />}
      />
    </Routes>
  );
}

export default App;
