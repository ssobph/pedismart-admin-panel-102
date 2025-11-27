import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Car,
  Filter, 
  Search, 
  Loader, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  ChevronDown,
  ChevronUp,
  Navigation,
  Timer,
  Route
} from "lucide-react";
import { tripLogsService } from "../services/tripLogsService";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/common/Header";

const TripLogsPage = () => {
  const { isDarkMode } = useTheme();
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("COMPLETED");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRide, setExpandedRide] = useState(null);

  // Fetch rides on component mount
  useEffect(() => {
    fetchTripLogs();
  }, []);

  // Apply filters when search term or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, startDate, endDate, rides]);

  const fetchTripLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tripLogsService.getTripLogs();
      setRides(response.rides || []);
    } catch (error) {
      console.error("Error fetching trip logs:", error);
      setError("Failed to load trip logs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rides];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(ride => ride.status === statusFilter);
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
        const otp = ride.otp || '';
        const pickupAddress = ride.pickup?.address?.toLowerCase() || '';
        const dropAddress = ride.drop?.address?.toLowerCase() || '';
        
        return customerName.includes(searchLower) ||
               riderName.includes(searchLower) ||
               otp.includes(searchLower) ||
               pickupAddress.includes(searchLower) ||
               dropAddress.includes(searchLower);
      });
    }

    setFilteredRides(filtered);
  };

  const handleExport = () => {
    tripLogsService.exportTripLogs(filteredRides);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    
    if (diffMs < 0) return "N/A";
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMins}m`;
    }
    return `${diffMins}m`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle size={20} className="text-green-500" />;
      case "CANCELLED":
        return <XCircle size={20} className="text-red-500" />;
      case "TIMEOUT":
        return <Clock size={20} className="text-orange-500" />;
      case "SEARCHING_FOR_RIDER":
        return <Search size={20} className="text-blue-500" />;
      case "START":
      case "ARRIVED":
        return <Navigation size={20} className="text-purple-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return isDarkMode ? "bg-green-900 bg-opacity-30 border-green-700 text-green-400" : "bg-green-100 border-green-300 text-green-700";
      case "CANCELLED":
        return isDarkMode ? "bg-red-900 bg-opacity-30 border-red-700 text-red-400" : "bg-red-100 border-red-300 text-red-700";
      case "TIMEOUT":
        return isDarkMode ? "bg-orange-900 bg-opacity-30 border-orange-700 text-orange-400" : "bg-orange-100 border-orange-300 text-orange-700";
      case "SEARCHING_FOR_RIDER":
        return isDarkMode ? "bg-blue-900 bg-opacity-30 border-blue-700 text-blue-400" : "bg-blue-100 border-blue-300 text-blue-700";
      case "START":
      case "ARRIVED":
        return isDarkMode ? "bg-purple-900 bg-opacity-30 border-purple-700 text-purple-400" : "bg-purple-100 border-purple-300 text-purple-700";
      default:
        return isDarkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-gray-100 border-gray-300 text-gray-700";
    }
  };

  const formatDistance = (distance) => {
    if (!distance || distance === 0) return '0.00 km';
    const distanceInKm = distance > 1000 ? (distance / 1000).toFixed(2) : distance.toFixed(2);
    return `${distanceInKm} km`;
  };

  const toggleExpand = (rideId) => {
    setExpandedRide(expandedRide === rideId ? null : rideId);
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Trip Logs" />
      
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Description */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900 bg-opacity-20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
          <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
            Trip Logs for Audits, Disputes & Analytics
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            These logs show everything that happens during a trip. We store:
          </p>
          <ul className={`text-sm mt-2 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <li>• <strong>Trip Distance</strong> - The official total distance of the trip (after calculation)</li>
            <li>• <strong>Request Time</strong> - When the ride request was created</li>
            <li>• <strong>Accept Time</strong> - When driver accepts the booking</li>
            <li>• <strong>Start Time</strong> - When driver goes online or starts navigation</li>
            <li>• <strong>Pickup Time</strong> - When passenger is picked up</li>
            <li>• <strong>Dropoff Time</strong> - When passenger is dropped off</li>
            <li>• <strong>End Time</strong> - When trip is fully completed</li>
          </ul>
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
                  placeholder="Search by customer, rider, OTP, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="TIMEOUT">Timeout</option>
                <option value="SEARCHING_FOR_RIDER">Searching</option>
                <option value="START">In Progress</option>
                <option value="ARRIVED">Arrived</option>
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
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Results Count and Export */}
          <div className="mt-4 flex justify-between items-center">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {filteredRides.length} of {rides.length} trips
            </span>
            <button
              onClick={handleExport}
              disabled={filteredRides.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                filteredRides.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader size={40} className="animate-spin text-blue-500" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRides.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No trip logs found</p>
            <p className="text-sm mt-2">Try adjusting your filters or search term</p>
          </motion.div>
        )}

        {/* Trip Logs List */}
        {!loading && filteredRides.length > 0 && (
          <div className="space-y-4">
            {filteredRides.map((ride, index) => {
              const isExpanded = expandedRide === ride._id;
              const rideNumber = rides.length - rides.findIndex(r => r._id === ride._id);
              
              return (
                <motion.div
                  key={ride._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`backdrop-blur-md shadow-lg rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 bg-opacity-50 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                  {/* Ride Header - Always Visible */}
                  <div 
                    className={`p-4 cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                    onClick={() => toggleExpand(ride._id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(ride.status)} border`}>
                          {getStatusIcon(ride.status)}
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            Trip #{rideNumber}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDateTime(ride.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Quick Info */}
                        <div className="hidden md:flex items-center space-x-4">
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span className="font-medium">Distance:</span> {formatDistance(ride.finalDistance || ride.distance)}
                          </div>
                          {ride.tripLogs?.endTime && ride.tripLogs?.acceptTime && (
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span className="font-medium">Duration:</span> {calculateDuration(ride.tripLogs.acceptTime, ride.tripLogs.endTime)}
                            </div>
                          )}
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ride.status)} border`}>
                          {ride.status.replace(/_/g, ' ')}
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
                        {/* Left Column - Trip Timeline */}
                        <div>
                          <h4 className={`text-md font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            <Timer size={18} className="mr-2 text-blue-500" />
                            Trip Timeline
                          </h4>
                          
                          <div className="space-y-3">
                            {/* Request Time */}
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Request Time
                                </span>
                                <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                  {formatTime(ride.tripLogs?.requestTime || ride.createdAt)}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                When the ride request was created
                              </p>
                            </div>

                            {/* Accept Time */}
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Accept Time
                                </span>
                                <span className={`text-sm ${ride.tripLogs?.acceptTime ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                                  {formatTime(ride.tripLogs?.acceptTime)}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                When driver accepts the booking
                              </p>
                            </div>

                            {/* Start Time */}
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Start Time
                                </span>
                                <span className={`text-sm ${ride.tripLogs?.startTime ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                                  {formatTime(ride.tripLogs?.startTime)}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                When driver goes online or starts navigation
                              </p>
                            </div>

                            {/* Pickup Time */}
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Pickup Time
                                </span>
                                <span className={`text-sm ${ride.tripLogs?.pickupTime ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                                  {formatTime(ride.tripLogs?.pickupTime)}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                When passenger is picked up
                              </p>
                            </div>

                            {/* Dropoff Time */}
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Dropoff Time
                                </span>
                                <span className={`text-sm ${ride.tripLogs?.dropoffTime ? (isDarkMode ? 'text-orange-400' : 'text-orange-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                                  {formatTime(ride.tripLogs?.dropoffTime)}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                When passenger is dropped off
                              </p>
                            </div>

                            {/* End Time */}
                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                              <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  End Time
                                </span>
                                <span className={`text-sm ${ride.tripLogs?.endTime ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                                  {formatTime(ride.tripLogs?.endTime)}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                When trip is fully completed
                              </p>
                            </div>

                            {/* Auto-Cancelled Info (if applicable) */}
                            {ride.tripLogs?.autoCancelledAt && (
                              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900 bg-opacity-30 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                                <div className="flex justify-between items-center">
                                  <span className={`text-sm font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                                    Auto-Cancelled
                                  </span>
                                  <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                    {formatTime(ride.tripLogs?.autoCancelledAt)}
                                  </span>
                                </div>
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                                  {ride.tripLogs?.autoCancelledReason || 'System auto-cancelled'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column - Trip Details */}
                        <div>
                          <h4 className={`text-md font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            <Route size={18} className="mr-2 text-green-500" />
                            Trip Details
                          </h4>

                          {/* Distance Info */}
                          <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-indigo-900 bg-opacity-30 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200'}`}>
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                                Final Distance
                              </span>
                              <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                {formatDistance(ride.finalDistance || ride.distance)}
                              </span>
                            </div>
                          </div>

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
                              {ride.customer?.phone && (
                                <div className="flex items-center mt-1">
                                  <Phone size={12} className={`mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {ride.customer.phone}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                              <div className="flex items-center mb-2">
                                <Car size={16} className={`mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rider</span>
                              </div>
                              {ride.rider ? (
                                <>
                                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {ride.rider.firstName} {ride.rider.lastName}
                                  </p>
                                  {ride.rider.phone && (
                                    <div className="flex items-center mt-1">
                                      <Phone size={12} className={`mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {ride.rider.phone}
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  No rider assigned
                                </p>
                              )}
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

                          {/* OTP */}
                          {ride.otp && (
                            <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>OTP: </span>
                              <span className={`font-mono font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{ride.otp}</span>
                            </div>
                          )}

                          {/* Route Logs Summary (if available) */}
                          {ride.routeLogs && ride.status === "COMPLETED" && (
                            <div className={`mt-4 p-4 rounded-lg ${ride.routeLogs.hasSignificantDeviation ? (isDarkMode ? 'bg-red-900 bg-opacity-20 border border-red-700' : 'bg-red-50 border border-red-200') : (isDarkMode ? 'bg-purple-900 bg-opacity-20 border border-purple-700' : 'bg-purple-50 border border-purple-200')}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium ${ride.routeLogs.hasSignificantDeviation ? (isDarkMode ? 'text-red-400' : 'text-red-700') : (isDarkMode ? 'text-purple-400' : 'text-purple-700')}`}>
                                  Route Analysis
                                </span>
                                {ride.routeLogs.hasSignificantDeviation && (
                                  <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full">
                                    Deviation Alert
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estimated</p>
                                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {formatDistance(ride.routeLogs.estimatedDistance)}
                                  </p>
                                </div>
                                <div>
                                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Route</p>
                                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {formatDistance(ride.routeLogs.routeDistance)}
                                  </p>
                                </div>
                                <div>
                                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Deviation</p>
                                  <p className={`font-semibold ${ride.routeLogs.deviationPercentage > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {ride.routeLogs.deviationPercentage > 0 ? '+' : ''}{(ride.routeLogs.deviationPercentage || 0).toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
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

export default TripLogsPage;
