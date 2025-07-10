import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || error.message || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

// Chat API calls
export const chatAPI = {
  sendMessage: async (message, sessionId = null) => {
    const response = await api.post('/chat/send', { message, sessionId });
    return response.data;
  },
  
  getChatHistory: async () => {
    const response = await api.get('/chat/history');
    return response.data;
  },
  
  deleteChatSession: async (sessionId) => {
    const response = await api.delete(`/chat/session/${sessionId}`);
    return response.data;
  }
};

// Admin API calls
export const adminAPI = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  getPendingUsers: async () => {
    const response = await api.get('/admin/users/pending');
    return response.data;
  },
  
  approveUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/approve`);
    return response.data;
  },
  
  rejectUser: async (userId, reason = '') => {
    const response = await api.delete(`/admin/users/${userId}/reject`, {
      data: { reason }
    });
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },
  
  getAllChatHistory: async () => {
    const response = await api.get('/admin/chat-history');
    return response.data;
  },
  
  exportChatData: async () => {
    const response = await api.get('/admin/export-chats', {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default api;
