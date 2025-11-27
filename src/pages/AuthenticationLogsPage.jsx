import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Filter, 
  Calendar, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Key, 
  Lock, 
  Unlock,
  RefreshCw,
  Download,
  Search,
  AlertTriangle,
  Globe,
  Smartphone
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { authenticationLogService } from "../services/authenticationLogService";
import Header from "../components/common/Header";

const AuthenticationLogsPage = () => {
  const { isDarkMode } = useTheme();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: "",
    success: "",
    email: "",
    userRole: "",
    startDate: "",
    endDate: "",
    limit: 100,
    page: 1
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchAuthenticationLogs();
    fetchStats();
  }, []);

  const fetchAuthenticationLogs = async () => {
    try {
      setLoading(true);
      const response = await authenticationLogService.getAuthenticationLogs(filters);
      setLogs(response.logs || []);
      setPagination(response.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 });
    } catch (error) {
      console.error("Error fetching authentication logs:", error);
      alert("Failed to fetch authentication logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await authenticationLogService.getAuthenticationStats({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      setStats(response);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const applyFilters = () => {
    fetchAuthenticationLogs();
    fetchStats();
  };

  const clearFilters = () => {
    setFilters({
      eventType: "",
      success: "",
      email: "",
      userRole: "",
      startDate: "",
      endDate: "",
      limit: 100,
      page: 1
    });
    setTimeout(() => {
      fetchAuthenticationLogs();
      fetchStats();
    }, 100);
  };

  const handleExport = async () => {
    try {
      await authenticationLogService.exportAuthenticationLogs(filters);
      alert("Export successful!");
    } catch (error) {
      alert("Failed to export logs");
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    setTimeout(() => fetchAuthenticationLogs(), 100);
  };

  const getEventIcon = (eventType) => {
    const icons = {
      LOGIN_SUCCESS: <CheckCircle size={16} className="text-green-500" />,
      LOGIN_FAILED: <XCircle size={16} className="text-red-500" />,
      LOGIN_BLOCKED: <Lock size={16} className="text-orange-500" />,
      LOGOUT: <Unlock size={16} className="text-blue-500" />,
      PASSWORD_RESET_REQUEST: <Key size={16} className="text-yellow-500" />,
      PASSWORD_RESET_SUCCESS: <CheckCircle size={16} className="text-green-500" />,
      PASSWORD_RESET_FAILED: <XCircle size={16} className="text-red-500" />,
      OTP_SENT: <Smartphone size={16} className="text-blue-500" />,
      OTP_VERIFIED: <CheckCircle size={16} className="text-green-500" />,
      OTP_FAILED: <XCircle size={16} className="text-red-500" />,
      OTP_EXPIRED: <AlertTriangle size={16} className="text-orange-500" />,
      ACCOUNT_LOCKED: <Lock size={16} className="text-red-500" />,
      ACCOUNT_UNLOCKED: <Unlock size={16} className="text-green-500" />,
      TOKEN_REFRESH: <RefreshCw size={16} className="text-blue-500" />,
      TOKEN_REFRESH_FAILED: <XCircle size={16} className="text-red-500" />,
      REGISTRATION_SUCCESS: <CheckCircle size={16} className="text-green-500" />,
      REGISTRATION_FAILED: <XCircle size={16} className="text-red-500" />
    };
    return icons[eventType] || <Shield size={16} className="text-gray-500" />;
  };

  const getEventBadgeColor = (eventType, success) => {
    if (success) {
      return "bg-green-100 text-green-800";
    }
    
    const colors = {
      LOGIN_FAILED: "bg-red-100 text-red-800",
      LOGIN_BLOCKED: "bg-orange-100 text-orange-800",
      PASSWORD_RESET_FAILED: "bg-red-100 text-red-800",
      OTP_FAILED: "bg-red-100 text-red-800",
      OTP_EXPIRED: "bg-orange-100 text-orange-800",
      ACCOUNT_LOCKED: "bg-red-100 text-red-800",
      TOKEN_REFRESH_FAILED: "bg-red-100 text-red-800",
      REGISTRATION_FAILED: "bg-red-100 text-red-800"
    };
    return colors[eventType] || "bg-gray-100 text-gray-800";
  };

  const formatEventName = (eventType) => {
    return eventType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      customer: "bg-blue-100 text-blue-800",
      rider: "bg-purple-100 text-purple-800",
      admin: "bg-indigo-100 text-indigo-800",
      "super-admin": "bg-pink-100 text-pink-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Authentication Logs" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Events</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.overview?.totalEvents || 0}
                  </p>
                </div>
                <Shield className="text-indigo-500" size={24} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Successful Logins</p>
                  <p className="text-2xl font-bold text-green-500">
                    {stats.overview?.successfulLogins || 0}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={24} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Failed Logins</p>
                  <p className="text-2xl font-bold text-red-500">
                    {stats.overview?.failedLogins || 0}
                  </p>
                </div>
                <XCircle className="text-red-500" size={24} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</p>
                  <p className={`text-2xl font-bold ${stats.overview?.successRate >= 80 ? 'text-green-500' : stats.overview?.successRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {stats.overview?.successRate || 0}%
                  </p>
                </div>
                <Shield className={stats.overview?.successRate >= 80 ? 'text-green-500' : stats.overview?.successRate >= 50 ? 'text-yellow-500' : 'text-red-500'} size={24} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Password Resets</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {stats.overview?.passwordResets || 0}
                  </p>
                </div>
                <Key className="text-yellow-500" size={24} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>OTP Events</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {stats.overview?.otpEvents || 0}
                  </p>
                </div>
                <Smartphone className="text-blue-500" size={24} />
              </div>
            </motion.div>
          </div>
        )}

        {/* Recent Failed Attempts Alert */}
        {stats?.recentFailedAttempts?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mb-6`}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-500" size={20} />
              <h3 className={`font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
                Recent Failed Login Attempts (Last 24 Hours)
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.recentFailedAttempts.slice(0, 5).map((item, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 text-sm rounded ${isDarkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-800'}`}
                >
                  {item.email}: {item.count} attempts
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Filters
              </h3>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Event Type
              </label>
              <select
                value={filters.eventType}
                onChange={(e) => handleFilterChange("eventType", e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
              >
                <option value="">All Events</option>
                <option value="LOGIN_SUCCESS">Login Success</option>
                <option value="LOGIN_FAILED">Login Failed</option>
                <option value="LOGIN_BLOCKED">Login Blocked</option>
                <option value="LOGOUT">Logout</option>
                <option value="PASSWORD_RESET_REQUEST">Password Reset Request</option>
                <option value="PASSWORD_RESET_SUCCESS">Password Reset Success</option>
                <option value="PASSWORD_RESET_FAILED">Password Reset Failed</option>
                <option value="OTP_SENT">OTP Sent</option>
                <option value="OTP_VERIFIED">OTP Verified</option>
                <option value="OTP_FAILED">OTP Failed</option>
                <option value="OTP_EXPIRED">OTP Expired</option>
                <option value="ACCOUNT_LOCKED">Account Locked</option>
                <option value="ACCOUNT_UNLOCKED">Account Unlocked</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Status
              </label>
              <select
                value={filters.success}
                onChange={(e) => handleFilterChange("success", e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
              >
                <option value="">All</option>
                <option value="true">Success</option>
                <option value="false">Failed</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                User Role
              </label>
              <select
                value={filters.userRole}
                onChange={(e) => handleFilterChange("userRole", e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="rider">Rider</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Search Email
              </label>
              <div className="relative">
                <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={filters.email}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
                  placeholder="Search by email..."
                  className={`w-full pl-10 pr-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-2"
            >
              <Filter size={16} />
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md`}
            >
              Clear Filters
            </button>
            <button
              onClick={() => { fetchAuthenticationLogs(); fetchStats(); }}
              className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md flex items-center gap-2`}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Authentication Logs Table */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Date & Time
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Email
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Role
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Event
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    IP Address
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      <RefreshCw className="animate-spin inline mr-2" size={16} />
                      Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No authentication logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          <div>
                            <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium">{log.email}</div>
                            {log.user && (
                              <div className="text-xs text-gray-500">
                                {log.user.firstName} {log.user.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(log.userRole)}`}>
                          {log.userRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getEventIcon(log.eventType)}
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventBadgeColor(log.eventType, log.success)}`}>
                            {formatEventName(log.eventType)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.success ? (
                          <span className="flex items-center gap-1 text-green-500">
                            <CheckCircle size={16} />
                            Success
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500">
                            <XCircle size={16} />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <Globe size={16} className="mr-2 text-gray-400" />
                          {log.ipAddress || 'N/A'}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="max-w-xs truncate" title={log.description}>
                          {log.failureReason || log.description}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={`px-6 py-4 flex items-center justify-between border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 rounded ${pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Events by Type and Role Summary */}
        {stats && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Events by Type */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Events by Type
              </h3>
              <div className="space-y-2">
                {stats.eventsByType?.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEventIcon(item.type)}
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatEventName(item.type)}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Events by Role */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Events by Role
              </h3>
              <div className="space-y-2">
                {stats.eventsByRole?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(item.role)}`}>
                      {item.role || 'Unknown'}
                    </span>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AuthenticationLogsPage;
