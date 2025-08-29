import axios from 'axios';
import { API_BASE_URL } from '../config';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('admin_access_token');
};

// Create axios instance with auth header
const createAuthenticatedRequest = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

export const analyticsService = {
  // Get user statistics
  getUserStats: async (timeFilter = '24h') => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/api/analytics/user-stats?timeFilter=${timeFilter}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get ride statistics
  getRideStats: async (timeFilter = '24h') => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/api/analytics/ride-stats?timeFilter=${timeFilter}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ride statistics:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get combined analytics
  getCombinedAnalytics: async (timeFilter = '24h') => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/api/analytics/combined?timeFilter=${timeFilter}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching combined analytics:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default analyticsService;
