import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Trophy, Car, MapPin, DollarSign, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import analyticsService from "../../services/analyticsService";

const TopPerformingRiders = ({ timeFilter = "all" }) => {
  const { isDarkMode } = useTheme();
  const [topRiders, setTopRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch top performing riders data
  const fetchTopRiders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getTopPerformingRiders(timeFilter, 10);
      setTopRiders(data.topRiders || []);
    } catch (err) {
      console.error("Error fetching top performing riders:", err);
      setError("Failed to load top performing riders data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopRiders();
  }, [timeFilter]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Format distance
  const formatDistance = (value) => {
    return `${value.toFixed(1)} km`;
  };

  // Get vehicle icon
  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case "Single Motorcycle":
        return "🏍️";
      case "Tricycle":
        return "🛺";
      case "Cab":
        return "🚗";
      default:
        return "🚗";
    }
  };

  // Get ranking color
  const getRankingColor = (index) => {
    switch (index) {
      case 0:
        return "text-yellow-500"; // Gold
      case 1:
        return "text-gray-400"; // Silver
      case 2:
        return "text-amber-600"; // Bronze
      default:
        return isDarkMode ? "text-gray-300" : "text-gray-600";
    }
  };

  // Get ranking background
  const getRankingBg = (index) => {
    switch (index) {
      case 0:
        return "bg-yellow-500 bg-opacity-20";
      case 1:
        return "bg-gray-400 bg-opacity-20";
      case 2:
        return "bg-amber-600 bg-opacity-20";
      default:
        return isDarkMode ? "bg-gray-600 bg-opacity-20" : "bg-gray-100";
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-yellow-500 bg-opacity-20">
          <Trophy className="size-6 text-yellow-500" />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Top Performing Riders
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Based on completed rides and ratings
          </p>
        </div>
      </div>

      {/* Riders List */}
      <div className="space-y-3">
        {topRiders.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <User className="size-12 mx-auto mb-3 opacity-50" />
            <p>No rider data available for this period</p>
          </div>
        ) : (
          topRiders.map((rider, index) => (
            <motion.div
              key={rider.riderId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                isDarkMode
                  ? 'bg-gray-700 bg-opacity-50 border-gray-600 hover:bg-gray-600'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Rider Info */}
                <div className="flex items-center gap-4">
                  {/* Ranking */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getRankingBg(index)}`}>
                    {index < 3 ? (
                      <Trophy className={`size-5 ${getRankingColor(index)}`} />
                    ) : (
                      <span className={`font-bold text-lg ${getRankingColor(index)}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Rider Details */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {rider.firstName} {rider.lastName}
                      </h4>
                      <span className="text-lg">
                        {getVehicleIcon(rider.vehicleType)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <Star className="size-4 text-yellow-500 fill-current" />
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {rider.averageRating > 0 ? rider.averageRating.toFixed(1) : 'N/A'}
                        </span>
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({rider.totalRatings} reviews)
                        </span>
                      </div>

                      {/* Vehicle Type */}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {rider.vehicleType}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  {/* Total Rides */}
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <Car className="size-4 text-blue-500" />
                      <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {rider.totalRides}
                      </span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Rides
                    </p>
                  </div>

                  {/* Total Distance */}
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="size-4 text-green-500" />
                      <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatDistance(rider.totalDistance)}
                      </span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Distance
                    </p>
                  </div>

                  {/* Total Revenue */}
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="size-4 text-amber-500" />
                      <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(rider.totalRevenue)}
                      </span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Revenue
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {topRiders.length > 0 && (
        <div className={`mt-6 p-4 rounded-xl border ${
          isDarkMode ? 'bg-gray-700 bg-opacity-30 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {topRiders.reduce((sum, rider) => sum + rider.totalRides, 0)}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Rides
              </p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatDistance(topRiders.reduce((sum, rider) => sum + rider.totalDistance, 0))}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Distance
              </p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(topRiders.reduce((sum, rider) => sum + rider.totalRevenue, 0))}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Revenue
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopPerformingRiders;
