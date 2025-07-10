import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Chat from './pages/Chat';
import AdminPanel from './pages/AdminPanel';
import { Spinner } from 'react-bootstrap';

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated() ? 
          <Navigate to="/chat" replace /> : 
          <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/signup" 
        element={
          isAuthenticated() ? 
          <Navigate to="/chat" replace /> : 
          <Signup />
        } 
      />
      <Route 
        path="/login" 
        element={
          isAuthenticated() ? 
          <Navigate to="/chat" replace /> : 
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
    </Routes>
  );
}

export default App;
