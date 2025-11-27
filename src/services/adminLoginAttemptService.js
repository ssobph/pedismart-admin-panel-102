import { API_BASE_URL } from '../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const adminLoginAttemptService = {
  // Get all login attempts with filters
  getLoginAttempts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.email) queryParams.append('email', params.email);
      if (params.success !== undefined && params.success !== '') queryParams.append('success', params.success);
      if (params.isBlocked !== undefined && params.isBlocked !== '') queryParams.append('isBlocked', params.isBlocked);
      if (params.ipAddress) queryParams.append('ipAddress', params.ipAddress);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const url = `${API_BASE_URL}/api/admin-login-attempts?${queryParams.toString()}`;
      console.log('Fetching login attempts with URL:', url);
      
      const response = await fetch(url, { headers: getAuthHeaders() });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch login attempts');
      }
      
      const data = await response.json();
      console.log('Login attempts data received:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching login attempts:', error);
      throw error;
    }
  },

  // Get login statistics
  getLoginStats: async (startDate, endDate) => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const url = `${API_BASE_URL}/api/admin-login-attempts/stats?${queryParams.toString()}`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch login stats');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching login stats:', error);
      throw error;
    }
  },

  // Get attempts for a specific email
  getAttemptsByEmail: async (email, limit = 50) => {
    try {
      const url = `${API_BASE_URL}/api/admin-login-attempts/email/${encodeURIComponent(email)}?limit=${limit}`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch attempts by email');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching attempts by email:', error);
      throw error;
    }
  },

  // Unlock an email manually
  unlockEmail: async (email) => {
    try {
      const url = `${API_BASE_URL}/api/admin-login-attempts/unlock/${encodeURIComponent(email)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unlock email');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error unlocking email:', error);
      throw error;
    }
  },

  // Export login attempts as CSV
  exportLoginAttempts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.email) queryParams.append('email', params.email);
      if (params.success !== undefined && params.success !== '') queryParams.append('success', params.success);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      
      const url = `${API_BASE_URL}/api/admin-login-attempts/export?${queryParams.toString()}`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      
      if (!response.ok) {
        throw new Error('Failed to export login attempts');
      }
      
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `admin_login_attempts_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting login attempts:', error);
      throw error;
    }
  },

  // Clear old login attempts
  clearOldAttempts: async (daysOld = 30) => {
    try {
      const url = `${API_BASE_URL}/api/admin-login-attempts/cleanup`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ daysOld }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to clear old attempts');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error clearing old attempts:', error);
      throw error;
    }
  },
};

export default adminLoginAttemptService;
