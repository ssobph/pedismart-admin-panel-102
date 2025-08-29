import axios from 'axios';
import { API_BASE_URL } from '../config';

// Auth service functions
export const authService = {
  // Login admin
  login: async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      
      // Use the special admin login endpoint
      const response = await axios.post(`${API_BASE_URL}/api/auth/admin-login`, {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      // Store tokens in localStorage
      localStorage.setItem('admin_access_token', response.data.access_token);
      localStorage.setItem('admin_refresh_token', response.data.refresh_token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Logout admin
  logout: () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  },
  
  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('admin_access_token');
  },
  
  // Get current user
  getCurrentUser: () => {
    const userJson = localStorage.getItem('admin_user');
    return userJson ? JSON.parse(userJson) : null;
  },
  
  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
        refresh_token: refreshToken
      });
      
      localStorage.setItem('admin_access_token', response.data.access_token);
      localStorage.setItem('admin_refresh_token', response.data.refresh_token);
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error.response?.data || error.message);
      // If refresh fails, logout
      authService.logout();
      throw error;
    }
  }
};
