import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Clock, TrendingUp, Calendar, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import analyticsService from "../../services/analyticsService";

const PeakHoursAnalysis = ({ timeFilter = "all" }) => {
  const { isDarkMode } = useTheme();
  const [peakData, setPeakData] = useState({ hourlyData: [], dailyData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState("hourly"); // hourly or daily

  // Fetch peak hours analysis data
  const fetchPeakData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getPeakHoursAnalysis(timeFilter);
      
      // Format hourly data
      const formattedHourlyData = data.hourlyData.map(hour => ({
        hour: `${hour._id}:00`,
        hourNum: hour._id,
        rides: hour.totalRides,
        revenue: hour.totalRevenue,
        avgRides: Math.round(hour.avgRides * 10) / 10
      }));

      // Format daily data
      const formattedDailyData = data.dailyData.map(day => ({
        day: day.day,
        rides: day.totalRides,
        revenue: day.totalRevenue
      }));

      setPeakData({
        hourlyData: formattedHourlyData,
        dailyData: formattedDailyData
      });
    } catch (err) {
      console.error("Error fetching peak hours analysis:", err);
      setError("Failed to load peak hours analysis data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeakData();
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
                entry.dataKey === 'revenue' 
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

  // Get peak hour
  const getPeakHour = () => {
    if (peakData.hourlyData.length === 0) return null;
    return peakData.hourlyData.reduce((max, hour) => 
      hour.rides > max.rides ? hour : max
    );
  };

  // Get peak day
  const getPeakDay = () => {
    if (peakData.dailyData.length === 0) return null;
    return peakData.dailyData.reduce((max, day) => 
      day.rides > max.rides ? day : max
    );
  };

  // Get time period label
  const getTimePeriodLabel = (hour) => {
    if (hour >= 6 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 21) return "Evening";
    return "Night";
  };

  // Calculate summary stats
  const totalHourlyRides = peakData.hourlyData.reduce((sum, hour) => sum + hour.rides, 0);
  const totalDailyRides = peakData.dailyData.reduce((sum, day) => sum + day.rides, 0);
  const peakHour = getPeakHour();
  const peakDay = getPeakDay();

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
          <div className="p-2 rounded-lg bg-orange-500 bg-opacity-20">
            <Clock className="size-6 text-orange-500" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Peak Hours Analysis
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Ride patterns by time and day
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <button
            onClick={() => setViewType('hourly')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewType === 'hourly'
                ? isDarkMode ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white'
                : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hourly
          </button>
          <button
            onClick={() => setViewType('daily')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewType === 'daily'
                ? isDarkMode ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white'
                : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily
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
            <Clock className="size-4 text-orange-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Peak Hour
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {peakHour ? peakHour.hour : 'N/A'}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {peakHour ? `${peakHour.rides} rides` : 'No data'}
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
              Peak Day
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {peakDay ? peakDay.day : 'N/A'}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {peakDay ? `${peakDay.rides} rides` : 'No data'}
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
            <Sun className="size-4 text-yellow-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Peak Period
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {peakHour ? getTimePeriodLabel(peakHour.hourNum) : 'N/A'}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Most active time
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
            <TrendingUp className="size-4 text-green-500" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Total Rides
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {viewType === 'hourly' ? totalHourlyRides : totalDailyRides}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            In selected period
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
        <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {viewType === 'hourly' ? 'Hourly Distribution' : 'Daily Distribution'}
        </h4>

        {(viewType === 'hourly' ? peakData.hourlyData : peakData.dailyData).length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Clock className="size-12 mx-auto mb-3 opacity-50" />
            <p>No peak hours data available for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={viewType === 'hourly' ? peakData.hourlyData : peakData.dailyData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? '#374151' : '#e5e7eb'} 
              />
              <XAxis 
                dataKey={viewType === 'hourly' ? 'hour' : 'day'}
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
                angle={viewType === 'hourly' ? -45 : 0}
                textAnchor={viewType === 'hourly' ? 'end' : 'middle'}
                height={viewType === 'hourly' ? 80 : 60}
              />
              <YAxis 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="rides"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                name="Rides"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Time Period Breakdown */}
      {viewType === 'hourly' && peakData.hourlyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-white shadow-lg'
          }`}
        >
          <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Time Period Breakdown
          </h4>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {['Morning', 'Afternoon', 'Evening', 'Night'].map((period, index) => {
              const periodHours = peakData.hourlyData.filter(hour => {
                const hourNum = hour.hourNum;
                switch (period) {
                  case 'Morning': return hourNum >= 6 && hourNum < 12;
                  case 'Afternoon': return hourNum >= 12 && hourNum < 17;
                  case 'Evening': return hourNum >= 17 && hourNum < 21;
                  case 'Night': return hourNum >= 21 || hourNum < 6;
                  default: return false;
                }
              });

              const totalRides = periodHours.reduce((sum, hour) => sum + hour.rides, 0);
              const totalRevenue = periodHours.reduce((sum, hour) => sum + hour.revenue, 0);

              return (
                <motion.div
                  key={period}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-600 bg-opacity-50' : 'bg-gray-50'
                  }`}
                >
                  <h5 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {period}
                  </h5>
                  <div className="space-y-1">
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {totalRides}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      rides
                    </p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PeakHoursAnalysis;
