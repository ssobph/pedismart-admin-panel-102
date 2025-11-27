import { API_BASE_URL } from '../config';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Get all crash logs with filters
export const getCrashLogs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.errorType) queryParams.append('errorType', filters.errorType);
    if (filters.osName) queryParams.append('osName', filters.osName);
    if (filters.appVersion) queryParams.append('appVersion', filters.appVersion);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.isFatal !== undefined && filters.isFatal !== '') queryParams.append('isFatal', filters.isFatal);
    if (filters.userRole) queryParams.append('userRole', filters.userRole);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.page) queryParams.append('page', filters.page);
    
    const response = await fetch(
      `${API_BASE_URL}/api/crash-logs?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeader()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crash logs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching crash logs:', error);
    throw error;
  }
};

// Get crash statistics
export const getCrashStats = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    const response = await fetch(
      `${API_BASE_URL}/api/crash-logs/stats?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeader()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crash statistics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching crash statistics:', error);
    throw error;
  }
};

// Get a single crash log by ID
export const getCrashLogById = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/crash-logs/${id}`,
      {
        method: 'GET',
        headers: getAuthHeader()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch crash log');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching crash log:', error);
    throw error;
  }
};

// Update crash status
export const updateCrashStatus = async (id, statusData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/crash-logs/${id}/status`,
      {
        method: 'PATCH',
        headers: getAuthHeader(),
        body: JSON.stringify(statusData)
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update crash status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating crash status:', error);
    throw error;
  }
};

// Get similar crashes
export const getSimilarCrashes = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/crash-logs/${id}/similar`,
      {
        method: 'GET',
        headers: getAuthHeader()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch similar crashes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching similar crashes:', error);
    throw error;
  }
};

// Export crash logs as CSV
export const exportCrashLogs = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.errorType) queryParams.append('errorType', filters.errorType);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    const response = await fetch(
      `${API_BASE_URL}/api/crash-logs/export?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeader()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to export crash logs');
    }
    
    // Get the CSV content
    const csvContent = await response.text();
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crash_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting crash logs:', error);
    throw error;
  }
};

export const crashLogService = {
  getCrashLogs,
  getCrashStats,
  getCrashLogById,
  updateCrashStatus,
  getSimilarCrashes,
  exportCrashLogs
};
