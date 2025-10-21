import axios from 'axios';
import { API_BASE_URL } from '../config';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('admin_access_token');
};

// Create axios instance with auth header
const createAuthenticatedRequest = () => {
  const token = getAuthToken();
  console.log('Using auth token:', token ? 'Token exists' : 'No token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

export const rideService = {
  // Get all rides with optional filters
  getAllRides: async (filters = {}) => {
    try {
      const request = createAuthenticatedRequest();
      
      // Build query params
      let queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.vehicle) queryParams.append('vehicle', filters.vehicle);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const queryString = queryParams.toString();
      const url = `/admin/rides${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching rides with URL:', url);
      
      const response = await request.get(url);
      console.log('Ride data received:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching rides:', error.response?.data || error.message);
      throw error;
    }
  }
};
