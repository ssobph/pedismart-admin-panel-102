import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Car, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Hash, 
  Filter, 
  Search, 
  Loader, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Navigation
} from "lucide-react";
import { rideService } from "../services/rideService";
import { useTheme } from "../context/ThemeContext";

const RideHistoryPage = () => {
  const { isDarkMode } = useTheme();
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");

  // Fetch rides on component mount
  useEffect(() => {
    fetchRides();
  }, []);

  // Apply filters when search term or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, vehicleFilter, rides]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rideService.getAllRides();
      setRides(response.rides || []);
    } catch (error) {
      console.error("Error fetching rides:", error);
      setError("Failed to load ride history. Please try again later.");
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

    // Apply vehicle filter
    if (vehicleFilter !== "all") {
      filtered = filtered.filter(ride => ride.vehicle === vehicleFilter);
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

  const formatDate = (dateString) => {
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
    // Distance is stored in meters in the database
    if (!distance || distance === 0) {
      return '0.00 km';
    }
    // If distance is less than 1000, it's likely already in meters
    // If distance is greater than 1000, it could be in meters
    const distanceInKm = distance > 1000 ? (distance / 1000).toFixed(2) : distance.toFixed(2);
    return `${distanceInKm} km`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Ride History
        </h1>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          View and manage all ride records
        </p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          {/* Vehicle Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Vehicle Type
            </label>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All Vehicles</option>
              <option value="Single Motorcycle">Single Motorcycle</option>
              <option value="Tricycle">Tricycle</option>
              <option value="Cab">Cab</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {filteredRides.length} of {rides.length} rides
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader size={40} className="animate-spin text-blue-500" />
        </div>
      )}

      {/* Rides List */}
      {!loading && filteredRides.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
        >
          <Car size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No rides found</p>
          <p className="text-sm mt-2">Try adjusting your filters or search term</p>
        </motion.div>
      )}

      {!loading && filteredRides.length > 0 && (
        <div className="space-y-4">
          {filteredRides.map((ride, index) => {
            // Calculate ride number based on total rides count (newest first)
            const rideNumber = rides.length - rides.findIndex(r => r._id === ride._id);
            
            return (
              <motion.div
                key={ride._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`backdrop-blur-md shadow-lg rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 bg-opacity-50 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                {/* Ride Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(ride.status)} border`}>
                      {getStatusIcon(ride.status)}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        Ride #{rideNumber}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(ride.createdAt)}
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {ride.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${isDarkMode ? 'bg-blue-900 bg-opacity-30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                    {ride.vehicle}
                  </div>
                </div>

              {/* Ride Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Customer Info */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center mb-2">
                    <User size={16} className={`mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Customer</span>
                  </div>
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {ride.customer?.firstName} {ride.customer?.lastName}
                  </p>
                  {ride.customer?.phone && (
                    <div className="flex items-center mt-1">
                      <Phone size={14} className={`mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {ride.customer.phone}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rider Info */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
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
                          <Phone size={14} className={`mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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

                {/* OTP */}
                {ride.otp && (
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center mb-2">
                      <Hash size={16} className={`mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>OTP</span>
                    </div>
                    <p className={`font-semibold text-lg font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {ride.otp}
                    </p>
                  </div>
                )}
              </div>

              {/* Locations */}
              <div className="mt-4 space-y-2">
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

              {/* Distance */}
              <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-medium">Distance:</span> {formatDistance(ride.distance)}
              </div>

              {/* Passengers Section */}
              {ride.passengers && ride.passengers.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center mb-3">
                    <Users size={18} className={`mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Passengers ({ride.currentPassengerCount || ride.passengers.length}/{ride.maxPassengers || 6})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {ride.passengers.map((passenger, index) => (
                      <div 
                        key={passenger._id || index}
                        className={`p-3 rounded-lg border ${
                          isDarkMode 
                            ? 'bg-gray-700 bg-opacity-30 border-gray-600' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <User size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                              <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                {passenger.firstName} {passenger.lastName}
                                {passenger.isOriginalBooker && (
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                    isDarkMode 
                                      ? 'bg-blue-900 text-blue-300' 
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    Original Booker
                                  </span>
                                )}
                              </span>
                            </div>
                            {passenger.phone && (
                              <div className="flex items-center mt-1 ml-5">
                                <Phone size={12} className={`mr-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`} />
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {passenger.phone}
                                </span>
                              </div>
                            )}
                            {passenger.joinedAt && (
                              <div className="flex items-center mt-1 ml-5">
                                <Clock size={12} className={`mr-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`} />
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Joined: {new Date(passenger.joinedAt).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              passenger.status === 'ONBOARD' 
                                ? isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                                : passenger.status === 'DROPPED'
                                ? isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                : isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {passenger.status || 'WAITING'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RideHistoryPage;
