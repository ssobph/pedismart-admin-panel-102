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

export const tripLogsService = {
  // Get all rides with trip logs
  getTripLogs: async (filters = {}) => {
    try {
      const request = createAuthenticatedRequest();
      
      // Build query params
      let queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.search) queryParams.append('search', filters.search);
      
      const queryString = queryParams.toString();
      const url = `/admin/rides${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching trip logs with URL:', url);
      
      const response = await request.get(url);
      console.log('Trip logs data received:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching trip logs:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a single ride's trip log by ID
  getTripLogById: async (rideId) => {
    try {
      const request = createAuthenticatedRequest();
      const response = await request.get(`/admin/rides/${rideId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trip log:', error.response?.data || error.message);
      throw error;
    }
  },

  // Export trip logs to CSV
  exportTripLogs: (rides) => {
    const headers = [
      'Ride ID',
      'Status',
      'Early Stop',
      'Customer Name',
      'Customer Phone',
      'Rider Name',
      'Rider Phone',
      'Vehicle Type',
      'Pickup Address',
      'Drop Address',
      'Early Stop Address',
      'Early Stop Requested By',
      'Early Stop Reason',
      'Cancelled By',
      'Cancellation Reason',
      'Cancelled At',
      'Distance (km)',
      'Final Distance (km)',
      'Estimated Distance (km)',
      'Actual Distance (km)',
      'Route Distance (km)',
      'Deviation (%)',
      'Significant Deviation',
      'Request Time',
      'Accept Time',
      'Start Time',
      'Pickup Time',
      'Dropoff Time',
      'End Time',
      'Early Stop Time',
      'Auto-Cancelled At',
      'Auto-Cancel Reason',
      'Created At'
    ];

    const rows = rides.map(ride => [
      ride._id,
      ride.status,
      ride.earlyStop?.completedEarly ? 'Yes' : 'No',
      `${ride.customer?.firstName || ''} ${ride.customer?.lastName || ''}`.trim(),
      ride.customer?.phone || '',
      `${ride.rider?.firstName || ''} ${ride.rider?.lastName || ''}`.trim(),
      ride.rider?.phone || '',
      ride.vehicle,
      ride.pickup?.address || '',
      ride.drop?.address || '',
      ride.earlyStop?.address || '',
      ride.earlyStop?.requestedBy || '',
      ride.earlyStop?.reason || '',
      ride.cancelledBy || '',
      ride.cancellationReason || '',
      ride.cancelledAt || '',
      ride.distance?.toFixed(2) || '',
      ride.finalDistance?.toFixed(2) || '',
      ride.routeLogs?.estimatedDistance?.toFixed(2) || '',
      ride.routeLogs?.actualDistance?.toFixed(2) || '',
      ride.routeLogs?.routeDistance?.toFixed(2) || '',
      ride.routeLogs?.deviationPercentage?.toFixed(2) || '',
      ride.routeLogs?.hasSignificantDeviation ? 'Yes' : 'No',
      ride.tripLogs?.requestTime || '',
      ride.tripLogs?.acceptTime || '',
      ride.tripLogs?.startTime || '',
      ride.tripLogs?.pickupTime || '',
      ride.tripLogs?.dropoffTime || '',
      ride.tripLogs?.endTime || '',
      ride.earlyStop?.requestedAt || '',
      ride.tripLogs?.autoCancelledAt || '',
      ride.tripLogs?.autoCancelledReason || '',
      ride.createdAt || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trip_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
