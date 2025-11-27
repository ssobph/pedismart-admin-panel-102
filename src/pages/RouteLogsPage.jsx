import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Route, 
  MapPin, 
  Calendar, 
  User, 
  Car,
  Filter, 
  Search, 
  Loader, 
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Download,
  ChevronDown,
  ChevronUp,
  Navigation,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw
} from "lucide-react";
import { routeLogsService } from "../services/routeLogsService";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/common/Header";

const RouteLogsPage = () => {
  const { isDarkMode } = useTheme();
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deviationFilter, setDeviationFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRide, setExpandedRide] = useState(null);
  const [stats, setStats] = useState({
    totalRides: 0,
    avgDeviation: 0,
    significantDeviations: 0,
    avgEstimatedDistance: 0,
    avgActualDistance: 0,
    avgRouteDistance: 0,
  });

  // Fetch rides on component mount
  useEffect(() => {
    fetchRouteLogs();
  }, []);

  // Apply filters when search term or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, deviationFilter, startDate, endDate, rides]);

  // Calculate stats when filtered rides change
  useEffect(() => {
    calculateStats();
  }, [filteredRides]);

  const fetchRouteLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await routeLogsService.getRouteLogs();
      // Filter only completed rides with route logs
      const ridesWithRouteLogs = (response.rides || []).filter(
        ride => ride.status === "COMPLETED" && ride.routeLogs
      );
      setRides(ridesWithRouteLogs);
    } catch (error) {
      console.error("Error fetching route logs:", error);
      setError("Failed to load route logs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rides];

    // Apply deviation filter
    if (deviationFilter === "significant") {
      filtered = filtered.filter(ride => ride.routeLogs?.hasSignificantDeviation);
    } else if (deviationFilter === "normal") {
      filtered = filtered.filter(ride => !ride.routeLogs?.hasSignificantDeviation);
    } else if (deviationFilter === "positive") {
      filtered = filtered.filter(ride => (ride.routeLogs?.deviationPercentage || 0) > 0);
    } else if (deviationFilter === "negative") {
      filtered = filtered.filter(ride => (ride.routeLogs?.deviationPercentage || 0) < 0);
    }

    // Apply date filters
    if (startDate) {
      filtered = filtered.filter(ride => new Date(ride.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(ride => new Date(ride.createdAt) <= new Date(endDate + 'T23:59:59'));
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(ride => {
        const customerName = `${ride.customer?.firstName || ''} ${ride.customer?.lastName || ''}`.toLowerCase();
        const riderName = `${ride.rider?.firstName || ''} ${ride.rider?.lastName || ''}`.toLowerCase();
        const pickupAddress = ride.pickup?.address?.toLowerCase() || '';
        const dropAddress = ride.drop?.address?.toLowerCase() || '';
        
        return customerName.includes(searchLower) ||
               riderName.includes(searchLower) ||
               pickupAddress.includes(searchLower) ||
               dropAddress.includes(searchLower);
      });
    }

    setFilteredRides(filtered);
  };

  const calculateStats = () => {
    if (filteredRides.length === 0) {
      setStats({
        totalRides: 0,
        avgDeviation: 0,
        significantDeviations: 0,
        avgEstimatedDistance: 0,
        avgActualDistance: 0,
        avgRouteDistance: 0,
      });
      return;
    }

    const totalRides = filteredRides.length;
    const significantDeviations = filteredRides.filter(r => r.routeLogs?.hasSignificantDeviation).length;
    
    const deviations = filteredRides.map(r => r.routeLogs?.deviationPercentage || 0);
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / totalRides;
    
    const estimatedDistances = filteredRides.map(r => r.routeLogs?.estimatedDistance || 0);
    const avgEstimatedDistance = estimatedDistances.reduce((a, b) => a + b, 0) / totalRides;
    
    const actualDistances = filteredRides.map(r => r.routeLogs?.actualDistance || 0);
    const avgActualDistance = actualDistances.reduce((a, b) => a + b, 0) / totalRides;
    
    const routeDistances = filteredRides.map(r => r.routeLogs?.routeDistance || 0);
    const avgRouteDistance = routeDistances.reduce((a, b) => a + b, 0) / totalRides;

    setStats({
      totalRides,
      avgDeviation: Math.round(avgDeviation * 100) / 100,
      significantDeviations,
      avgEstimatedDistance: Math.round(avgEstimatedDistance * 100) / 100,
      avgActualDistance: Math.round(avgActualDistance * 100) / 100,
      avgRouteDistance: Math.round(avgRouteDistance * 100) / 100,
    });
  };

  const handleExport = () => {
    routeLogsService.exportRouteLogs(filteredRides);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDistance = (distance) => {
    if (!distance || distance === 0) return '0.00 km';
    return `${distance.toFixed(2)} km`;
  };

  const getDeviationIcon = (deviation) => {
    if (deviation > 0) {
      return <TrendingUp size={16} className="text-red-500" />;
    } else if (deviation < 0) {
      return <TrendingDown size={16} className="text-green-500" />;
    }
    return <Minus size={16} className="text-gray-500" />;
  };

  const getDeviationColor = (deviation, hasSignificant) => {
    if (hasSignificant) {
      return isDarkMode ? "text-red-400" : "text-red-600";
    }
    if (deviation > 10) {
      return isDarkMode ? "text-orange-400" : "text-orange-600";
    }
    if (deviation < -10) {
      return isDarkMode ? "text-green-400" : "text-green-600";
    }
    return isDarkMode ? "text-gray-300" : "text-gray-700";
  };

  const toggleExpand = (rideId) => {
    setExpandedRide(expandedRide === rideId ? null : rideId);
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Route Logs" />
      
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Description */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-purple-900 bg-opacity-20 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
            Route Logs - Distance Analytics
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Logs related to the travel route itself. What we store:
          </p>
          <ul className={`text-sm mt-2 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>• <strong>Estimated Distance</strong> - From routing API (shown to customer when booking)</li>
            <li>• <strong>Actual Distance</strong> - Direct path from pickup to dropoff coordinates</li>
            <li>• <strong>Route Distance</strong> - The path the driver actually took (from GPS tracking)</li>
          </ul>
          <p className={`text-sm mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>Useful for:</strong> Detecting route deviations, fair pricing, analytics (shortest route vs actual)
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
          >
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {stats.totalRides}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Rides
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}
          >
            <div className={`text-2xl font-bold ${stats.avgDeviation > 20 ? 'text-red-500' : stats.avgDeviation > 10 ? 'text-orange-500' : 'text-green-500'}`}>
              {stats.avgDeviation > 0 ? '+' : ''}{stats.avgDeviation}%
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Deviation
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900 bg-opacity-30 border-red-700' : 'bg-red-50 border-red-200'} border`}
          >
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {stats.significantDeviations}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Significant Deviations
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900 bg-opacity-30 border-blue-700' : 'bg-blue-50 border-blue-200'} border`}
          >
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {stats.avgEstimatedDistance} km
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Estimated
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900 bg-opacity-30 border-green-700' : 'bg-green-50 border-green-200'} border`}
          >
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {stats.avgActualDistance} km
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Actual
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900 bg-opacity-30 border-purple-700' : 'bg-purple-50 border-purple-200'} border`}
          >
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {stats.avgRouteDistance} km
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Route
            </div>
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border p-4 rounded-md mb-6 flex items-center ${isDarkMode ? 'bg-red-500 bg-opacity-20 border-red-500 text-red-200' : 'bg-red-100 border-red-300 text-red-800'}`}
          >
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-md shadow-lg rounded-xl p-6 border mb-6 ${isDarkMode ? 'bg-gray-800 bg-opacity-50 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Search
              </label>
              <div className="relative">
                <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search by customer, rider, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>
            </div>

            {/* Deviation Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Deviation
              </label>
              <select
                value={deviationFilter}
                onChange={(e) => setDeviationFilter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="all">All</option>
                <option value="significant">Significant (&gt;20%)</option>
                <option value="normal">Normal</option>
                <option value="positive">Longer Route</option>
                <option value="negative">Shorter Route</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>

            {/* End Date */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>
          </div>

          {/* Results Count and Actions */}
          <div className="mt-4 flex justify-between items-center">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {filteredRides.length} of {rides.length} completed rides with route logs
            </span>
            <div className="flex gap-2">
              <button
                onClick={fetchRouteLogs}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-800 dark:text-white`}
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                disabled={filteredRides.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  filteredRides.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader size={40} className="animate-spin text-purple-500" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRides.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            <Route size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No route logs found</p>
            <p className="text-sm mt-2">Route logs are generated when rides are completed</p>
          </motion.div>
        )}

        {/* Route Logs List */}
        {!loading && filteredRides.length > 0 && (
          <div className="space-y-4">
            {filteredRides.map((ride, index) => {
              const isExpanded = expandedRide === ride._id;
              const rideNumber = rides.length - rides.findIndex(r => r._id === ride._id);
              const deviation = ride.routeLogs?.deviationPercentage || 0;
              const hasSignificant = ride.routeLogs?.hasSignificantDeviation;
              
              return (
                <motion.div
                  key={ride._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`backdrop-blur-md shadow-lg rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 bg-opacity-50 border-gray-700' : 'bg-white border-gray-200'} ${hasSignificant ? (isDarkMode ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-red-500') : ''}`}
                >
                  {/* Ride Header - Always Visible */}
                  <div 
                    className={`p-4 cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                    onClick={() => toggleExpand(ride._id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${hasSignificant ? (isDarkMode ? 'bg-red-900 bg-opacity-50' : 'bg-red-100') : (isDarkMode ? 'bg-purple-900 bg-opacity-50' : 'bg-purple-100')}`}>
                          {hasSignificant ? (
                            <AlertTriangle size={20} className="text-red-500" />
                          ) : (
                            <Route size={20} className="text-purple-500" />
                          )}
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            Trip #{rideNumber}
                            {hasSignificant && (
                              <span className="ml-2 text-xs px-2 py-1 bg-red-500 text-white rounded-full">
                                Significant Deviation
                              </span>
                            )}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDateTime(ride.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Quick Distance Info */}
                        <div className="hidden md:flex items-center space-x-6">
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span className="font-medium">Est:</span> {formatDistance(ride.routeLogs?.estimatedDistance)}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span className="font-medium">Route:</span> {formatDistance(ride.routeLogs?.routeDistance)}
                          </div>
                          <div className={`flex items-center gap-1 text-sm font-semibold ${getDeviationColor(deviation, hasSignificant)}`}>
                            {getDeviationIcon(deviation)}
                            <span>{deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        {isExpanded ? (
                          <ChevronUp size={24} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                        ) : (
                          <ChevronDown size={24} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Distance Comparison */}
                        <div>
                          <h4 className={`text-md font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            <Route size={18} className="mr-2 text-purple-500" />
                            Distance Comparison
                          </h4>
                          
                          <div className="space-y-3">
                            {/* Estimated Distance */}
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900 bg-opacity-30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                    Estimated Distance
                                  </span>
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    From routing API (shown to customer)
                                  </p>
                                </div>
                                <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {formatDistance(ride.routeLogs?.estimatedDistance)}
                                </span>
                              </div>
                            </div>

                            {/* Actual Distance */}
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900 bg-opacity-30 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                                    Actual Distance
                                  </span>
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    Direct path (pickup to dropoff)
                                  </p>
                                </div>
                                <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {formatDistance(ride.routeLogs?.actualDistance)}
                                </span>
                              </div>
                            </div>

                            {/* Route Distance */}
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900 bg-opacity-30 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                                    Route Distance
                                  </span>
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    Driver's actual path (GPS tracked)
                                  </p>
                                </div>
                                <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {formatDistance(ride.routeLogs?.routeDistance)}
                                </span>
                              </div>
                            </div>

                            {/* Deviation */}
                            <div className={`p-4 rounded-lg ${hasSignificant ? (isDarkMode ? 'bg-red-900 bg-opacity-30 border border-red-700' : 'bg-red-50 border border-red-200') : (isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50')}`}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className={`text-sm font-medium ${hasSignificant ? (isDarkMode ? 'text-red-400' : 'text-red-700') : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                                    Route Deviation
                                  </span>
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {hasSignificant ? 'Exceeds 20% threshold' : 'Within normal range'}
                                  </p>
                                </div>
                                <div className={`flex items-center gap-2 text-xl font-bold ${getDeviationColor(deviation, hasSignificant)}`}>
                                  {getDeviationIcon(deviation)}
                                  <span>{deviation > 0 ? '+' : ''}{deviation.toFixed(2)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Trip Details */}
                        <div>
                          <h4 className={`text-md font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            <Navigation size={18} className="mr-2 text-green-500" />
                            Trip Details
                          </h4>

                          {/* Customer & Rider Info */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                              <div className="flex items-center mb-2">
                                <User size={16} className={`mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Customer</span>
                              </div>
                              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                {ride.customer?.firstName} {ride.customer?.lastName}
                              </p>
                            </div>

                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                              <div className="flex items-center mb-2">
                                <Car size={16} className={`mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rider</span>
                              </div>
                              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                {ride.rider?.firstName} {ride.rider?.lastName}
                              </p>
                            </div>
                          </div>

                          {/* Locations */}
                          <div className="space-y-2">
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900 bg-opacity-20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
                              <div className="flex items-start">
                                <MapPin size={16} className={`mr-2 mt-1 flex-shrink-0 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                                <div className="flex-1">
                                  <span className={`text-xs font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>PICKUP</span>
                                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {ride.pickup?.address}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900 bg-opacity-20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                              <div className="flex items-start">
                                <MapPin size={16} className={`mr-2 mt-1 flex-shrink-0 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                                <div className="flex-1">
                                  <span className={`text-xs font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>DROP-OFF</span>
                                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {ride.drop?.address}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Visual Distance Bar */}
                          <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Distance Comparison
                            </span>
                            <div className="mt-3 space-y-2">
                              {/* Estimated */}
                              <div className="flex items-center gap-2">
                                <span className={`text-xs w-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Est.</span>
                                <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: '100%' }}
                                  />
                                </div>
                                <span className={`text-xs w-16 text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {formatDistance(ride.routeLogs?.estimatedDistance)}
                                </span>
                              </div>
                              {/* Route */}
                              <div className="flex items-center gap-2">
                                <span className={`text-xs w-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Route</span>
                                <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${hasSignificant ? 'bg-red-500' : 'bg-purple-500'}`}
                                    style={{ 
                                      width: `${Math.min(((ride.routeLogs?.routeDistance || 0) / (ride.routeLogs?.estimatedDistance || 1)) * 100, 150)}%` 
                                    }}
                                  />
                                </div>
                                <span className={`text-xs w-16 text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {formatDistance(ride.routeLogs?.routeDistance)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default RouteLogsPage;
