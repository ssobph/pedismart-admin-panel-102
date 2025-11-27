import { API_BASE_URL } from '../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_access_token');
  console.log('fareConfigService using token:', token ? 'Token exists' : 'No token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Get all fare configurations
export const getAllFareConfigs = async (includeInactive = true) => {
  const response = await fetch(
    `${API_BASE_URL}/api/fare-config?includeInactive=${includeInactive}`,
    {
      headers: getAuthHeaders(),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch fare configurations');
  }
  
  return response.json();
};

// Get fare config by vehicle type
export const getFareConfigByVehicle = async (vehicleType) => {
  const response = await fetch(
    `${API_BASE_URL}/api/fare-config/vehicle/${encodeURIComponent(vehicleType)}`,
    {
      headers: getAuthHeaders(),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch fare configuration');
  }
  
  return response.json();
};

// Create or update fare configuration
export const saveFareConfig = async (fareConfig) => {
  const response = await fetch(`${API_BASE_URL}/api/fare-config`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(fareConfig),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save fare configuration');
  }
  
  return response.json();
};

// Toggle fare config active status
export const toggleFareConfigStatus = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/fare-config/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle fare configuration status');
  }
  
  return response.json();
};

// Delete fare configuration
export const deleteFareConfig = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/fare-config/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete fare configuration');
  }
  
  return response.json();
};

// Initialize default fare configurations
export const initializeDefaultFareConfigs = async () => {
  const response = await fetch(`${API_BASE_URL}/api/fare-config/initialize`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initialize default fare configurations');
  }
  
  return response.json();
};

// Calculate fare estimate (for testing)
export const calculateFareEstimate = async (vehicleType, distanceKm, passengerCount = 1) => {
  const response = await fetch(`${API_BASE_URL}/api/fare-config/calculate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      vehicleType,
      distanceKm,
      passengerCount,
      bookingTime: new Date().toISOString(),
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to calculate fare estimate');
  }
  
  return response.json();
};
