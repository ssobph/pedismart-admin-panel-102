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

export const routeLogsService = {
  // Get all rides with route logs
  getRouteLogs: async (filters = {}) => {
    try {
      const request = createAuthenticatedRequest();
      
      // Build query params
      let queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.search) queryParams.append('search', filters.search);
      
      const queryString = queryParams.toString();
      const url = `/admin/rides${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching route logs with URL:', url);
      
      const response = await request.get(url);
      console.log('Route logs data received:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching route logs:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a single ride's route log by ID
  getRouteLogById: async (rideId) => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/admin/rides/${rideId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching route log:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get route logs statistics
  getRouteLogsStats: async () => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get('/admin/rides');
      const rides = response.data.rides || [];
      
      // Filter completed rides with route logs
      const completedRides = rides.filter(r => r.status === 'COMPLETED' && r.routeLogs);
      
      if (completedRides.length === 0) {
        return {
          totalRides: 0,
          avgDeviation: 0,
          significantDeviations: 0,
          avgEstimatedDistance: 0,
          avgActualDistance: 0,
          avgRouteDistance: 0,
        };
      }

      const totalRides = completedRides.length;
      const significantDeviations = completedRides.filter(r => r.routeLogs?.hasSignificantDeviation).length;
      
      const deviations = completedRides.map(r => r.routeLogs?.deviationPercentage || 0);
      const avgDeviation = deviations.reduce((a, b) => a + b, 0) / totalRides;
      
      const estimatedDistances = completedRides.map(r => r.routeLogs?.estimatedDistance || 0);
      const avgEstimatedDistance = estimatedDistances.reduce((a, b) => a + b, 0) / totalRides;
      
      const actualDistances = completedRides.map(r => r.routeLogs?.actualDistance || 0);
      const avgActualDistance = actualDistances.reduce((a, b) => a + b, 0) / totalRides;
      
      const routeDistances = completedRides.map(r => r.routeLogs?.routeDistance || 0);
      const avgRouteDistance = routeDistances.reduce((a, b) => a + b, 0) / totalRides;

      return {
        totalRides,
        avgDeviation: Math.round(avgDeviation * 100) / 100,
        significantDeviations,
        avgEstimatedDistance: Math.round(avgEstimatedDistance * 100) / 100,
        avgActualDistance: Math.round(avgActualDistance * 100) / 100,
        avgRouteDistance: Math.round(avgRouteDistance * 100) / 100,
      };
    } catch (error) {
      console.error('Error fetching route logs stats:', error.response?.data || error.message);
      throw error;
    }
  },

  // Export route logs to CSV
  exportRouteLogs: (rides) => {
    const headers = [
      'Ride ID',
      'Customer Name',
      'Customer Phone',
      'Rider Name',
      'Rider Phone',
      'Vehicle Type',
      'Pickup Address',
      'Drop Address',
      'Estimated Distance (km)',
      'Actual Distance (km)',
      'Route Distance (km)',
      'Deviation (%)',
      'Significant Deviation',
      'Created At',
      'Completed At'
    ];

    const rows = rides.map(ride => [
      ride._id,
      `${ride.customer?.firstName || ''} ${ride.customer?.lastName || ''}`.trim(),
      ride.customer?.phone || '',
      `${ride.rider?.firstName || ''} ${ride.rider?.lastName || ''}`.trim(),
      ride.rider?.phone || '',
      ride.vehicle,
      ride.pickup?.address || '',
      ride.drop?.address || '',
      ride.routeLogs?.estimatedDistance?.toFixed(2) || '',
      ride.routeLogs?.actualDistance?.toFixed(2) || '',
      ride.routeLogs?.routeDistance?.toFixed(2) || '',
      ride.routeLogs?.deviationPercentage?.toFixed(2) || '',
      ride.routeLogs?.hasSignificantDeviation ? 'Yes' : 'No',
      ride.createdAt || '',
      ride.tripLogs?.endTime || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `route_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
