import { API_BASE_URL } from '../config';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Get all authentication logs with filters
export const getAuthenticationLogs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.eventType) queryParams.append('eventType', filters.eventType);
    if (filters.success !== undefined && filters.success !== '') queryParams.append('success', filters.success);
    if (filters.email) queryParams.append('email', filters.email);
    if (filters.userRole) queryParams.append('userRole', filters.userRole);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.ipAddress) queryParams.append('ipAddress', filters.ipAddress);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.page) queryParams.append('page', filters.page);
    
    const response = await fetch(
      `${API_BASE_URL}/api/authentication-logs?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeader()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch authentication logs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching authentication logs:', error);
    throw error;
  }
};

// Get authentication statistics
export const getAuthenticationStats = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    const response = await fetch(
      `${API_BASE_URL}/api/authentication-logs/stats?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeader()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch authentication statistics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching authentication statistics:', error);
    throw error;
  }
};

// Get authentication logs for a specific user
export const getUserAuthenticationLogs = async (userId, limit = 50) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/authentication-logs/user/${userId}?limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeader()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user authentication logs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user authentication logs:', error);
    throw error;
  }
};

// Get authentication logs by email
export const getLogsByEmail = async (email, limit = 50) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/authentication-logs/email/${encodeURIComponent(email)}?limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeader()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch logs by email');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching logs by email:', error);
    throw error;
  }
};

// Export authentication logs as CSV
export const exportAuthenticationLogs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.eventType) queryParams.append('eventType', filters.eventType);
    if (filters.success !== undefined && filters.success !== '') queryParams.append('success', filters.success);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    const response = await fetch(
      `${API_BASE_URL}/api/authentication-logs/export?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeader()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to export authentication logs');
    }
    
    // Get the CSV content
    const csvContent = await response.text();
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `authentication_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting authentication logs:', error);
    throw error;
  }
};

export const authenticationLogService = {
  getAuthenticationLogs,
  getAuthenticationStats,
  getUserAuthenticationLogs,
  getLogsByEmail,
  exportAuthenticationLogs
};
