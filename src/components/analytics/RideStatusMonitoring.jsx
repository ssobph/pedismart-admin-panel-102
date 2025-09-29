import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Users, Clock, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import analyticsService from "../../services/analyticsService";

const RideStatusMonitoring = () => {
  const { isDarkMode } = useTheme();
  const [monitoringData, setMonitoringData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch ride status monitoring data
  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getRideStatusMonitoring();
      setMonitoringData(data);
    } catch (err) {
      console.error("Error fetching ride status monitoring:", err);
      setError("Failed to load ride status monitoring data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    
    // Auto-refresh every 30 seconds for real-time data
    const interval = setInterval(fetchMonitoringData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'SEARCHING_FOR_RIDER':
        return 'text-yellow-500';
      case 'START':
        return 'text-blue-500';
      case 'ARRIVED':
        return 'text-green-500';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  // Get status background
  const getStatusBg = (status) => {
    switch (status) {
      case 'SEARCHING_FOR_RIDER':
        return 'bg-yellow-500 bg-opacity-20';
      case 'START':
        return 'bg-blue-500 bg-opacity-20';
      case 'ARRIVED':
        return 'bg-green-500 bg-opacity-20';
      default:
        return isDarkMode ? 'bg-gray-600 bg-opacity-20' : 'bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'SEARCHING_FOR_RIDER':
        return AlertCircle;
      case 'START':
        return MapPin;
      case 'ARRIVED':
        return CheckCircle;
      default:
        return Activity;
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'SEARCHING_FOR_RIDER':
        return 'Searching for Rider';
      case 'START':
        return 'In Progress';
      case 'ARRIVED':
        return 'Arrived';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p className="font-bold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const totalActiveRides = Object.values(monitoringData?.currentStatus || {}).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500 bg-opacity-20">
            <Activity className="size-6 text-blue-500" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Real-time Ride Monitoring
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Live status of ongoing rides
            </p>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Live
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-white shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500 bg-opacity-20">
              <Activity className="size-5 text-blue-500" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalActiveRides}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Rides
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-white shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500 bg-opacity-20">
              <Users className="size-5 text-green-500" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {monitoringData?.activeRiders || 0}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Riders
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-white shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500 bg-opacity-20">
              <AlertCircle className="size-5 text-yellow-500" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {monitoringData?.waitingCustomers || 0}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Waiting Customers
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-white shadow-lg'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500 bg-opacity-20">
              <Clock className="size-5 text-purple-500" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {monitoringData?.averageWaitTime || 0}m
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Wait Time
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ride Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`p-6 rounded-xl ${
          isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-white shadow-lg'
        }`}
      >
        <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Current Ride Status Distribution
        </h4>

        <div className="space-y-4">
          {Object.entries(monitoringData?.currentStatus || {}).map(([status, count], index) => {
            const StatusIcon = getStatusIcon(status);
            const percentage = totalActiveRides > 0 ? ((count / totalActiveRides) * 100).toFixed(1) : 0;

            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-lg ${getStatusBg(status)}`}
              >
                <div className="flex items-center gap-3">
                  <StatusIcon className={`size-5 ${getStatusColor(status)}`} />
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getStatusLabel(status)}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {percentage}% of active rides
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-2xl font-bold ${getStatusColor(status)}`}>
                    {count}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    rides
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {totalActiveRides === 0 && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Activity className="size-12 mx-auto mb-3 opacity-50" />
            <p>No active rides at the moment</p>
          </div>
        )}
      </motion.div>

      {/* System Health Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-gray-700 bg-opacity-30 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              System Status: Operational
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Last updated: {new Date().toLocaleTimeString()}
            </span>
            <button
              onClick={fetchMonitoringData}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Refresh
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RideStatusMonitoring;
