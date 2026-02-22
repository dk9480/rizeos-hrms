import API from './api';
import toast from 'react-hot-toast';

const authService = {
  // Register new company
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      toast.success('Registration successful!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  },

  // Get current user
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Decode JWT token (simple decode)
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (error) {
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;