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

export const userService = {
  // Get all users with optional filters
  getAllUsers: async (filters = {}) => {
    try {
      const request = createAuthenticatedRequest();
      
      // Build query params
      let queryParams = new URLSearchParams();
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sex) queryParams.append('sex', filters.sex);
      if (filters.userRole) queryParams.append('userRole', filters.userRole);
      if (filters.vehicleType) queryParams.append('vehicleType', filters.vehicleType);
      if (filters.hasDocuments !== undefined) queryParams.append('hasDocuments', filters.hasDocuments);
      
      const queryString = queryParams.toString();
      const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching users with URL:', url);
      
      const response = await request.get(url);
      console.log('User data received:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/admin/users/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Approve user
  approveUser: async (userId) => {
    try {
      console.log(`Approving user with ID: ${userId}`);
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const request = createAuthenticatedRequest();
      const response = await request.put(`/admin/users/${userId}/approve`);
      console.log('Approve response:', response.data);
      
      // Validate response structure
      if (!response.data || !response.data.user) {
        throw new Error('Invalid response from server - missing user data');
      }
      
      return response.data.user;
    } catch (error) {
      console.error(`Error approving user ${userId}:`, error.response?.data || error.message);
      
      // Create a more descriptive error
      const errorMessage = error.response?.data?.message || error.message || 'Failed to approve user';
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.userId = userId;
      
      throw enhancedError;
    }
  },
  
  // Disapprove user
  disapproveUser: async (userId, data = {}) => {
    try {
      console.log(`Disapproving user with ID: ${userId}`, data);
      const request = createAuthenticatedRequest();
      const response = await request.put(`/admin/users/${userId}/disapprove`, data);
      console.log('Disapprove response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error(`Error disapproving user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update user
  updateUser: async (userId, userData) => {
    try {
      const request = createAuthenticatedRequest();
      
      // Create a copy of userData to avoid modifying the original
      const updatedData = { ...userData };
      
      // Handle special fields if needed
      console.log(`Updating user with ID: ${userId}`, updatedData);
      console.log('VehicleType being sent:', updatedData.vehicleType);
      
      const response = await request.put(`/admin/users/${userId}`, updatedData);
      console.log('Update response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Add penalty to user
  addPenalty: async (userId, data = {}) => {
    try {
      console.log(`Adding penalty to user with ID: ${userId}`, data);
      const request = createAuthenticatedRequest();
      const response = await request.put(`/admin/users/${userId}/penalty`, data);
      console.log('Add penalty response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error(`Error adding penalty to user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Delete user
  deleteUser: async (userId) => {
    try {
      console.log(`Deleting user with ID: ${userId}`);
      const request = createAuthenticatedRequest();
      const response = await request.delete(`/admin/users/${userId}`);
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get current user profile
  getProfile: async () => {
    try {
      const request = createAuthenticatedRequest();
      // Get admin ID from localStorage
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      const adminId = adminUser._id;
      
      if (!adminId) {
        throw new Error('Admin ID not found. Please log in again.');
      }
      
      const response = await request.get(`/api/admin-management/admins/${adminId}`);
      console.log('Profile data received:', response.data);
      return response.data.admin;
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Update current user profile
  updateProfile: async (profileData) => {
    try {
      console.log('Updating profile with data:', profileData);
      const request = createAuthenticatedRequest();
      
      // Get admin ID from localStorage
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      const adminId = adminUser._id;
      
      if (!adminId) {
        throw new Error('Admin ID not found. Please log in again.');
      }
      
      const response = await request.put(`/api/admin-management/admins/${adminId}`, profileData);
      console.log('Profile update response:', response.data);
      return response.data.admin;
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      throw error;
    }
  }
};
