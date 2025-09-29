import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import analyticsService from "../../services/analyticsService";

const RevenueTrendsChart = ({ timeFilter = "all" }) => {
  const { isDarkMode } = useTheme();
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState("line"); // line or bar

  // Fetch revenue trends data
  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getRevenueTrends(timeFilter);
      
      // Format data for charts
      const formattedData = data.trends.map(trend => ({
        period: trend.period,
        revenue: trend.revenue,
        rides: trend.rides,
        distance: trend.distance,
        avgRevenue: trend.rides > 0 ? (trend.revenue / trend.rides).toFixed(2) : 0
      }));
      
      setTrendsData(formattedData);
    } catch (err) {
      console.error("Error fetching revenue trends:", err);
      setError("Failed to load revenue trends data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendsData();
  }, [timeFilter]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {
                entry.dataKey === 'revenue' || entry.dataKey === 'avgRevenue' 
                  ? formatCurrency(entry.value)
                  : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get chart title based on time filter
  const getChartTitle = () => {
    switch (timeFilter) {
      case '24h':
        return 'Hourly Revenue Trends';
      case 'week':
        return 'Daily Revenue Trends';
      case 'month':
        return 'Weekly Revenue Trends';
      default:
        return 'Revenue Trends';
    }
  };

  // Calculate summary stats
  const totalRevenue = trendsData.reduce((sum, item) => sum + item.revenue, 0);
  const totalRides = trendsData.reduce((sum, item) => sum + item.rides, 0);
  const avgRevenuePerRide = totalRides > 0 ? (totalRevenue / totalRides) : 0;
  const peakRevenue = Math.max(...trendsData.map(item => item.revenue));

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500 bg-opacity-20">
            <TrendingUp className="size-6 text-green-500" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getChartTitle()}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Revenue performance over time
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <button
            onClick={() => setViewType('line')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewType === 'line'
                ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setViewType('bar')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewType === 'bar'
                ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bar
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="size-4 text-green-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Total Revenue
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(totalRevenue)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="size-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Total Rides
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalRides}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-purple-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Avg per Ride
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(avgRevenuePerRide)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-amber-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Peak Revenue
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(peakRevenue)}
          </p>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`p-6 rounded-xl ${
          isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-white shadow-lg'
        }`}
      >
        {trendsData.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <TrendingUp className="size-12 mx-auto mb-3 opacity-50" />
            <p>No revenue data available for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {viewType === 'line' ? (
              <LineChart data={trendsData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
                />
                <XAxis 
                  dataKey="period" 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={trendsData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
                />
                <XAxis 
                  dataKey="period" 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="revenue"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
};

export default RevenueTrendsChart;
