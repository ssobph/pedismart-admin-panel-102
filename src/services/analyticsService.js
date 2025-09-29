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
  },

  // Get top performing riders
  getTopPerformingRiders: async (timeFilter = '24h', limit = 10) => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/api/analytics/top-riders?timeFilter=${timeFilter}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top performing riders:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get revenue trends
  getRevenueTrends: async (timeFilter = '24h') => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/api/analytics/revenue-trends?timeFilter=${timeFilter}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue trends:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get real-time ride status monitoring
  getRideStatusMonitoring: async () => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/api/analytics/ride-monitoring`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ride status monitoring:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get peak hours analysis
  getPeakHoursAnalysis: async (timeFilter = 'week') => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/api/analytics/peak-hours?timeFilter=${timeFilter}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching peak hours analysis:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get popular routes
  getPopularRoutes: async (timeFilter = 'all', limit = 10) => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/api/analytics/popular-routes?timeFilter=${timeFilter}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching popular routes:', error.response?.data || error.message);
      throw error;
    }
  },

  // Debug: Get completed rides information
  getCompletedRidesDebug: async () => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/api/analytics/debug/completed-rides`);
      return response.data;
    } catch (error) {
      console.error('Error fetching debug data:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default analyticsService;
