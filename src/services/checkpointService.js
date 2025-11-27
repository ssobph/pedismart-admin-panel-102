import { API_BASE_URL } from "../config";

const getAuthHeaders = () => {
  const token = localStorage.getItem("admin_access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Checkpoint Snapshot Service
 * Handles all API calls related to checkpoint snapshots
 */
export const checkpointService = {
  /**
   * Get all checkpoints with filtering and pagination
   */
  getAllCheckpoints: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.rideId) queryParams.append("rideId", params.rideId);
    if (params.riderId) queryParams.append("riderId", params.riderId);
    if (params.checkpointType) queryParams.append("checkpointType", params.checkpointType);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await fetch(
      `${API_BASE_URL}/api/checkpoints?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch checkpoints");
    }

    return response.json();
  },

  /**
   * Get checkpoint statistics
   */
  getStatistics: async (startDate, endDate) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/checkpoints/stats?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch checkpoint statistics");
    }

    return response.json();
  },

  /**
   * Get recent checkpoints for live monitoring
   */
  getRecentCheckpoints: async (limit = 20, checkpointType = null) => {
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit);
    if (checkpointType) queryParams.append("checkpointType", checkpointType);

    const response = await fetch(
      `${API_BASE_URL}/api/checkpoints/recent?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recent checkpoints");
    }

    return response.json();
  },

  /**
   * Get checkpoints for a specific ride with route reconstruction
   */
  getRideCheckpoints: async (rideId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/checkpoints/ride/${rideId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ride checkpoints");
    }

    return response.json();
  },

  /**
   * Get checkpoint summary for a specific rider
   */
  getRiderSummary: async (riderId, startDate, endDate) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/checkpoints/rider/${riderId}?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch rider checkpoint summary");
    }

    return response.json();
  },

  /**
   * Export checkpoints to CSV
   */
  exportCheckpoints: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.rideId) queryParams.append("rideId", params.rideId);
    if (params.riderId) queryParams.append("riderId", params.riderId);
    if (params.checkpointType) queryParams.append("checkpointType", params.checkpointType);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const response = await fetch(
      `${API_BASE_URL}/api/checkpoints/export?${queryParams.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export checkpoints");
    }

    // Get the CSV content
    const csvContent = await response.text();
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `checkpoints_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default checkpointService;
