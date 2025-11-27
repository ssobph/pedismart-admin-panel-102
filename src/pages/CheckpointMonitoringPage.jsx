import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  Clock,
  User,
  Car,
  Filter,
  Search,
  Loader,
  AlertCircle,
  CheckCircle,
  Download,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Activity,
  Route,
  Target,
  Play,
  Square,
  Circle,
  TrendingUp,
  Calendar,
  Eye,
} from "lucide-react";
import { checkpointService } from "../services/checkpointService";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/common/Header";

const CheckpointMonitoringPage = () => {
  const { isDarkMode } = useTheme();
  const [checkpoints, setCheckpoints] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [showRideModal, setShowRideModal] = useState(false);

  // Filters
  const [checkpointType, setCheckpointType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch checkpoints
  const fetchCheckpoints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await checkpointService.getAllCheckpoints({
        page,
        limit: 25,
        checkpointType: checkpointType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy: "capturedAt",
        sortOrder: "desc",
      });

      setCheckpoints(response.checkpoints || []);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Error fetching checkpoints:", err);
      setError("Failed to load checkpoints. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, checkpointType, startDate, endDate]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await checkpointService.getStatistics(startDate, endDate);
      setStatistics(response.stats);
    } catch (err) {
      console.error("Error fetching statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [startDate, endDate]);

  // Initial fetch
  useEffect(() => {
    fetchCheckpoints();
    fetchStatistics();
  }, [fetchCheckpoints, fetchStatistics]);

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchCheckpoints();
      }, 10000); // Refresh every 10 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, fetchCheckpoints]);

  // View ride checkpoints
  const viewRideCheckpoints = async (rideId) => {
    try {
      const response = await checkpointService.getRideCheckpoints(rideId);
      setRideDetails(response);
      setShowRideModal(true);
    } catch (err) {
      console.error("Error fetching ride checkpoints:", err);
      setError("Failed to load ride details.");
    }
  };

  // Export checkpoints
  const handleExport = async () => {
    try {
      await checkpointService.exportCheckpoints({
        checkpointType: checkpointType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    } catch (err) {
      console.error("Error exporting checkpoints:", err);
      setError("Failed to export checkpoints.");
    }
  };

  // Get checkpoint type icon
  const getCheckpointIcon = (type) => {
    switch (type) {
      case "SEARCHING":
        return <Search size={18} className="text-blue-500" />;
      case "ACCEPTED":
        return <CheckCircle size={18} className="text-green-500" />;
      case "PICKUP":
        return <Target size={18} className="text-yellow-500" />;
      case "ONGOING":
        return <Play size={18} className="text-purple-500" />;
      case "DROPOFF":
        return <Square size={18} className="text-red-500" />;
      default:
        return <Circle size={18} className="text-gray-500" />;
    }
  };

  // Get checkpoint type color
  const getCheckpointColor = (type) => {
    switch (type) {
      case "SEARCHING":
        return isDarkMode
          ? "bg-blue-900 bg-opacity-30 border-blue-700 text-blue-400"
          : "bg-blue-100 border-blue-300 text-blue-700";
      case "ACCEPTED":
        return isDarkMode
          ? "bg-green-900 bg-opacity-30 border-green-700 text-green-400"
          : "bg-green-100 border-green-300 text-green-700";
      case "PICKUP":
        return isDarkMode
          ? "bg-yellow-900 bg-opacity-30 border-yellow-700 text-yellow-400"
          : "bg-yellow-100 border-yellow-300 text-yellow-700";
      case "ONGOING":
        return isDarkMode
          ? "bg-purple-900 bg-opacity-30 border-purple-700 text-purple-400"
          : "bg-purple-100 border-purple-300 text-purple-700";
      case "DROPOFF":
        return isDarkMode
          ? "bg-red-900 bg-opacity-30 border-red-700 text-red-400"
          : "bg-red-100 border-red-300 text-red-700";
      default:
        return isDarkMode
          ? "bg-gray-700 border-gray-600 text-gray-300"
          : "bg-gray-100 border-gray-300 text-gray-700";
    }
  };

  // Format date/time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format distance
  const formatDistance = (distance) => {
    if (!distance || distance === 0) return "0.00 km";
    return `${distance.toFixed(2)} km`;
  };

  // Filter checkpoints by search term
  const filteredCheckpoints = checkpoints.filter((cp) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const riderName = `${cp.riderId?.firstName || ""} ${cp.riderId?.lastName || ""}`.toLowerCase();
    const customerName = `${cp.customerId?.firstName || ""} ${cp.customerId?.lastName || ""}`.toLowerCase();
    const address = (cp.address || "").toLowerCase();
    return (
      riderName.includes(search) ||
      customerName.includes(search) ||
      address.includes(search) ||
      cp.checkpointType.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Checkpoint Monitoring" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Description */}
        <div
          className={`mb-6 p-4 rounded-lg ${
            isDarkMode
              ? "bg-indigo-900 bg-opacity-20 border border-indigo-700"
              : "bg-indigo-50 border border-indigo-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold mb-2 ${
              isDarkMode ? "text-indigo-400" : "text-indigo-700"
            }`}
          >
            Checkpoint Snapshots - GPS State Tracking
          </h2>
          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            Instead of saving raw GPS every second, we capture important state snapshots:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-blue-500" />
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                SEARCHING - Waiting for booking
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                ACCEPTED - Ride accepted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Target size={16} className="text-yellow-500" />
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                PICKUP - At pickup location
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Play size={16} className="text-purple-500" />
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                ONGOING - During ride
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Square size={16} className="text-red-500" />
              <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                DROPOFF - Trip completed
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {!statsLoading && statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${
                isDarkMode
                  ? "bg-gray-800 bg-opacity-50 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500 bg-opacity-20">
                  <Activity size={24} className="text-blue-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Total Checkpoints
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    {statistics.totals?.totalCheckpoints || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-4 rounded-xl border ${
                isDarkMode
                  ? "bg-gray-800 bg-opacity-50 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500 bg-opacity-20">
                  <Route size={24} className="text-green-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Unique Rides
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    {statistics.totals?.uniqueRides || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`p-4 rounded-xl border ${
                isDarkMode
                  ? "bg-gray-800 bg-opacity-50 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500 bg-opacity-20">
                  <Car size={24} className="text-purple-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Active Riders
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    {statistics.totals?.uniqueRiders || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-4 rounded-xl border ${
                isDarkMode
                  ? "bg-gray-800 bg-opacity-50 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500 bg-opacity-20">
                  <TrendingUp size={24} className="text-orange-500" />
                </div>
                <div>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Avg Distance
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    {formatDistance(statistics.distance?.avgDistance || 0)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Checkpoint Type Breakdown */}
        {!statsLoading && statistics?.byType && statistics.byType.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border ${
              isDarkMode
                ? "bg-gray-800 bg-opacity-50 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3 className={`text-md font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Checkpoint Distribution
            </h3>
            <div className="flex flex-wrap gap-3">
              {statistics.byType.map((stat) => (
                <div
                  key={stat._id}
                  className={`px-4 py-2 rounded-lg border ${getCheckpointColor(stat._id)}`}
                >
                  <div className="flex items-center gap-2">
                    {getCheckpointIcon(stat._id)}
                    <span className="font-medium">{stat._id}</span>
                  </div>
                  <p className="text-lg font-bold mt-1">{stat.count}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border p-4 rounded-md mb-6 flex items-center ${
              isDarkMode
                ? "bg-red-500 bg-opacity-20 border-red-500 text-red-200"
                : "bg-red-100 border-red-300 text-red-800"
            }`}
          >
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`backdrop-blur-md shadow-lg rounded-xl p-6 border mb-6 ${
            isDarkMode
              ? "bg-gray-800 bg-opacity-50 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Search
              </label>
              <div className="relative">
                <Search
                  size={20}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search by rider, customer, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Checkpoint Type Filter */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Type
              </label>
              <select
                value={checkpointType}
                onChange={(e) => {
                  setCheckpointType(e.target.value);
                  setPage(1);
                }}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">All Types</option>
                <option value="SEARCHING">Searching</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="PICKUP">Pickup</option>
                <option value="ONGOING">Ongoing</option>
                <option value="DROPOFF">Dropoff</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* End Date */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Actions Row */}
          <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Showing {filteredCheckpoints.length} checkpoints
                {pagination && ` (Page ${pagination.page} of ${pagination.pages})`}
              </span>
              
              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  autoRefresh
                    ? "bg-green-600 text-white"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <RefreshCw size={14} className={autoRefresh ? "animate-spin" : ""} />
                {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchCheckpoints}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                disabled={filteredCheckpoints.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  filteredCheckpoints.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
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
            <Loader size={40} className="animate-spin text-blue-500" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCheckpoints.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <MapPin size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No checkpoints found</p>
            <p className="text-sm mt-2">Try adjusting your filters or wait for new ride activity</p>
          </motion.div>
        )}

        {/* Checkpoints List */}
        {!loading && filteredCheckpoints.length > 0 && (
          <div className="space-y-3">
            {filteredCheckpoints.map((checkpoint, index) => (
              <motion.div
                key={checkpoint._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`p-4 rounded-xl border ${
                  isDarkMode
                    ? "bg-gray-800 bg-opacity-50 border-gray-700 hover:bg-gray-700"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                } transition-colors cursor-pointer`}
                onClick={() => setSelectedCheckpoint(
                  selectedCheckpoint?._id === checkpoint._id ? null : checkpoint
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Checkpoint Type Badge */}
                    <div
                      className={`p-2 rounded-lg border ${getCheckpointColor(
                        checkpoint.checkpointType
                      )}`}
                    >
                      {getCheckpointIcon(checkpoint.checkpointType)}
                    </div>

                    {/* Main Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {checkpoint.checkpointType}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          Seq #{checkpoint.sequenceNumber}
                        </span>
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {checkpoint.address || `${checkpoint.location.latitude.toFixed(6)}, ${checkpoint.location.longitude.toFixed(6)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Rider Info */}
                    <div className="hidden md:block text-right">
                      <div className="flex items-center gap-1">
                        <Car size={14} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                        <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {checkpoint.riderId?.firstName} {checkpoint.riderId?.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                        <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {checkpoint.customerId?.firstName} {checkpoint.customerId?.lastName}
                        </span>
                      </div>
                    </div>

                    {/* Distance & Time */}
                    <div className="text-right">
                      <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                        {formatDistance(checkpoint.cumulativeDistance)}
                      </p>
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {formatDateTime(checkpoint.capturedAt)}
                      </p>
                    </div>

                    {/* View Ride Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewRideCheckpoints(checkpoint.rideId?._id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? "hover:bg-gray-600 text-gray-400 hover:text-white"
                          : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                      }`}
                      title="View ride details"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Expand Icon */}
                    {selectedCheckpoint?._id === checkpoint._id ? (
                      <ChevronUp size={20} className={isDarkMode ? "text-gray-400" : "text-gray-600"} />
                    ) : (
                      <ChevronDown size={20} className={isDarkMode ? "text-gray-400" : "text-gray-600"} />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedCheckpoint?._id === checkpoint._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`mt-4 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Coordinates
                        </p>
                        <p className={`text-sm font-mono ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {checkpoint.location.latitude.toFixed(6)}, {checkpoint.location.longitude.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Distance from Previous
                        </p>
                        <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {formatDistance(checkpoint.distanceFromPrevious)}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Duration from Previous
                        </p>
                        <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {checkpoint.durationFromPrevious}s
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Interpolation Points
                        </p>
                        <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {checkpoint.interpolationPoints?.length || 0} points
                        </p>
                      </div>
                    </div>
                    {checkpoint.location.speed && (
                      <div className="mt-2">
                        <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Speed: {(checkpoint.location.speed * 3.6).toFixed(1)} km/h | 
                          Heading: {checkpoint.location.heading?.toFixed(0)}° |
                          Accuracy: {checkpoint.location.accuracy?.toFixed(0)}m
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg ${
                page === 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } ${isDarkMode ? "text-white" : "text-gray-800"}`}
            >
              Previous
            </button>
            <span className={`px-4 py-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className={`px-4 py-2 rounded-lg ${
                page === pagination.pages
                  ? "bg-gray-400 cursor-not-allowed"
                  : isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } ${isDarkMode ? "text-white" : "text-gray-800"}`}
            >
              Next
            </button>
          </div>
        )}

        {/* Ride Details Modal */}
        {showRideModal && rideDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-3xl max-h-[80vh] overflow-auto m-4 p-6 rounded-xl ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Ride Route Reconstruction
                </h3>
                <button
                  onClick={() => setShowRideModal(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Ride Info */}
              <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Pickup</p>
                    <p className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                      {rideDetails.ride?.pickup?.address}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Drop-off</p>
                    <p className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                      {rideDetails.ride?.drop?.address}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Distance</p>
                    <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      {formatDistance(rideDetails.totalDistance)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Duration</p>
                    <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      {Math.floor(rideDetails.totalDuration / 60)}m {rideDetails.totalDuration % 60}s
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Checkpoints</p>
                    <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      {rideDetails.checkpoints?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkpoints Timeline */}
              <div className="space-y-3">
                <h4 className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Checkpoint Timeline
                </h4>
                {rideDetails.checkpoints?.map((cp, idx) => (
                  <div
                    key={cp._id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg border ${getCheckpointColor(cp.checkpointType)}`}>
                      {getCheckpointIcon(cp.checkpointType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                          {cp.checkpointType}
                        </span>
                        <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {formatDateTime(cp.capturedAt)}
                        </span>
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {cp.address || `${cp.location.latitude.toFixed(6)}, ${cp.location.longitude.toFixed(6)}`}
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                        Distance: {formatDistance(cp.cumulativeDistance)} | 
                        {cp.interpolationPoints?.length || 0} interpolation points
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckpointMonitoringPage;
