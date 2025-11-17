import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, TrendingUp, ArrowRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import analyticsService from "../../services/analyticsService";

const PopularRoutes = ({ timeFilter = "all" }) => {
  const { isDarkMode } = useTheme();
  const [routesData, setRoutesData] = useState({
    popularRoutes: [],
    popularPickups: [],
    popularDrops: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("routes"); // routes, pickups, drops

  // Fetch popular routes data
  const fetchRoutesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getPopularRoutes(timeFilter, 10);
      setRoutesData({
        popularRoutes: data.popularRoutes || [],
        popularPickups: data.popularPickups || [],
        popularDrops: data.popularDrops || []
      });
    } catch (err) {
      console.error("Error fetching popular routes:", err);
      setError("Failed to load popular routes data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutesData();
  }, [timeFilter]);

  // Format distance
  const formatDistance = (value) => {
    return `${value.toFixed(1)} km`;
  };

  // Get tab data
  const getTabData = () => {
    switch (activeTab) {
      case 'routes':
        return routesData.popularRoutes;
      case 'pickups':
        return routesData.popularPickups;
      case 'drops':
        return routesData.popularDrops;
      default:
        return [];
    }
  };

  // Get tab title
  const getTabTitle = () => {
    switch (activeTab) {
      case 'routes':
        return 'Popular Routes';
      case 'pickups':
        return 'Popular Pickup Locations';
      case 'drops':
        return 'Popular Drop Locations';
      default:
        return 'Popular Routes';
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

  const currentData = getTabData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-500 bg-opacity-20">
          <Navigation className="size-6 text-purple-500" />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Popular Routes & Locations
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Most frequently used routes and locations
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <button
          onClick={() => setActiveTab('routes')}
          className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'routes'
              ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
              : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Routes
        </button>
        <button
          onClick={() => setActiveTab('pickups')}
          className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'pickups'
              ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
              : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pickups
        </button>
        <button
          onClick={() => setActiveTab('drops')}
          className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeTab === 'drops'
              ? isDarkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
              : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Drops
        </button>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`p-6 rounded-xl ${
          isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-white shadow-lg'
        }`}
      >
        <h4 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {getTabTitle()}
        </h4>

        {currentData.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <MapPin className="size-12 mx-auto mb-3 opacity-50" />
            <p>No {activeTab} data available for this period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                  isDarkMode
                    ? 'bg-gray-600 bg-opacity-50 border-gray-500 hover:bg-gray-600'
                    : 'bg-gray-50 border-gray-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Ranking and Location Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Ranking */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getRankingBg(index)}`}>
                      {index < 3 ? (
                        <TrendingUp className={`size-5 ${getRankingColor(index)}`} />
                      ) : (
                        <span className={`font-bold text-lg ${getRankingColor(index)}`}>
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Location Details */}
                    <div className="flex-1">
                      {activeTab === 'routes' ? (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.pickupAddress}
                            </h5>
                            <ArrowRight className={`size-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                            <h5 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.dropAddress}
                            </h5>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="size-4 text-blue-500" />
                              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatDistance(item.avgDistance)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h5 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item._id}
                          </h5>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="size-4 text-purple-500" />
                      <span className={`font-bold text-2xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.count}
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      rides
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Summary Stats */}
      {currentData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-4 rounded-xl border ${
            isDarkMode ? 'bg-gray-700 bg-opacity-30 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentData.reduce((sum, item) => sum + item.count, 0)}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Rides
              </p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentData.length}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Unique {activeTab === 'routes' ? 'Routes' : 'Locations'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PopularRoutes;
