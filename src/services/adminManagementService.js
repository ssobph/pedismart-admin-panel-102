import axios from 'axios';
import { API_BASE_URL } from '../config';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('admin_access_token');
};

// Create axios instance with auth header
const createAuthRequest = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const adminManagementService = {
  // Get all admins (super-admin only)
  getAllAdmins: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin-management/admins`,
        createAuthRequest()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },

  // Get admin by ID
  getAdminById: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin-management/admins/${id}`,
        createAuthRequest()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching admin:', error);
      throw error;
    }
  },

  // Create new admin (super-admin only)
  createAdmin: async (adminData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin-management/admins`,
        adminData,
        createAuthRequest()
      );
      return response.data;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  // Update admin
  updateAdmin: async (id, adminData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin-management/admins/${id}`,
        adminData,
        createAuthRequest()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  },

  // Delete admin (super-admin only)
  deleteAdmin: async (id) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin-management/admins/${id}`,
        createAuthRequest()
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  },

  // Toggle admin status (super-admin only)
  toggleAdminStatus: async (id) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/admin-management/admins/${id}/toggle-status`,
        {},
        createAuthRequest()
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling admin status:', error);
      throw error;
    }
  },

  // Get activity logs
  getActivityLogs: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.targetType) queryParams.append('targetType', filters.targetType);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.adminId) queryParams.append('adminId', filters.adminId);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const url = `${API_BASE_URL}/api/admin-management/activity-logs${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await axios.get(url, createAuthRequest());
      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  },

  // Admin login
  adminLogin: async (email, password) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin-management/login`,
        { email, password }
      );
      return response.data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  },
};
