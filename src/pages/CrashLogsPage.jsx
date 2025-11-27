import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Filter, 
  Calendar, 
  User, 
  Smartphone,
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  Bug,
  Monitor,
  Cpu,
  Eye,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { crashLogService } from "../services/crashLogService";
import Header from "../components/common/Header";

const CrashLogsPage = () => {
  const { isDarkMode } = useTheme();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrash, setSelectedCrash] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    errorType: "",
    osName: "",
    status: "",
    isFatal: "",
    search: "",
    startDate: "",
    endDate: "",
    limit: 50,
    page: 1
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchCrashLogs();
    fetchStats();
  }, []);

  const fetchCrashLogs = async () => {
    try {
      setLoading(true);
      const response = await crashLogService.getCrashLogs(filters);
      setLogs(response.logs || []);
      setPagination(response.pagination || { currentPage: 1, totalPages: 1, totalCount: 0 });
    } catch (error) {
      console.error("Error fetching crash logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await crashLogService.getCrashStats({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      setStats(response);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const applyFilters = () => {
    fetchCrashLogs();
    fetchStats();
  };

  const clearFilters = () => {
    setFilters({
      errorType: "",
      osName: "",
      status: "",
      isFatal: "",
      search: "",
      startDate: "",
      endDate: "",
      limit: 50,
      page: 1
    });
    setTimeout(() => {
      fetchCrashLogs();
      fetchStats();
    }, 100);
  };

  const handleExport = async () => {
    try {
      await crashLogService.exportCrashLogs(filters);
    } catch (error) {
      alert("Failed to export logs");
    }
  };

  const handleStatusUpdate = async (crashId, newStatus) => {
    try {
      await crashLogService.updateCrashStatus(crashId, { status: newStatus });
      fetchCrashLogs();
      fetchStats();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const viewCrashDetails = (crash) => {
    setSelectedCrash(crash);
    setShowDetailModal(true);
  };

  const getErrorTypeIcon = (errorType) => {
    const icons = {
      crash: <Bug size={16} className="text-red-500" />,
      exception: <AlertTriangle size={16} className="text-orange-500" />,
      anr: <Clock size={16} className="text-yellow-500" />,
      oom: <Cpu size={16} className="text-purple-500" />,
      network: <Zap size={16} className="text-blue-500" />,
      js_error: <Bug size={16} className="text-orange-500" />,
      native_crash: <Bug size={16} className="text-red-600" />,
      unhandled_rejection: <AlertTriangle size={16} className="text-red-500" />
    };
    return icons[errorType] || <Bug size={16} className="text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: "bg-blue-100 text-blue-800",
      investigating: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      ignored: "bg-gray-100 text-gray-800",
      duplicate: "bg-purple-100 text-purple-800"
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getOSIcon = (osName) => {
    if (osName === 'ios') return '🍎';
    if (osName === 'android') return '🤖';
    return '💻';
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="App Crash Logs" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Crashes</p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.overview?.totalCrashes || 0}
                  </p>
                </div>
                <Bug className="text-red-500" size={24} />
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
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fatal Crashes</p>
                  <p className="text-2xl font-bold text-red-500">
                    {stats.overview?.fatalCrashes || 0}
                  </p>
                </div>
                <AlertTriangle className="text-red-500" size={24} />
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
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>New (Unresolved)</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {stats.overview?.newCrashes || 0}
                  </p>
                </div>
                <Bug className="text-blue-500" size={24} />
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
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Resolved</p>
                  <p className="text-2xl font-bold text-green-500">
                    {stats.overview?.resolvedCrashes || 0}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={24} />
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
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last 24h</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {stats.overview?.recentCrashes || 0}
                  </p>
                </div>
                <Clock className="text-orange-500" size={24} />
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
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Affected Users</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {stats.overview?.affectedUsers || 0}
                  </p>
                </div>
                <User className="text-purple-500" size={24} />
              </div>
            </motion.div>
          </div>
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
                Error Type
              </label>
              <select
                value={filters.errorType}
                onChange={(e) => handleFilterChange("errorType", e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
              >
                <option value="">All Types</option>
                <option value="crash">Crash</option>
                <option value="exception">Exception</option>
                <option value="anr">ANR (App Not Responding)</option>
                <option value="oom">Out of Memory</option>
                <option value="network">Network Error</option>
                <option value="js_error">JavaScript Error</option>
                <option value="native_crash">Native Crash</option>
                <option value="unhandled_rejection">Unhandled Rejection</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Platform
              </label>
              <select
                value={filters.osName}
                onChange={(e) => handleFilterChange("osName", e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
              >
                <option value="">All Platforms</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="ignored">Ignored</option>
                <option value="duplicate">Duplicate</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Severity
              </label>
              <select
                value={filters.isFatal}
                onChange={(e) => handleFilterChange("isFatal", e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
              >
                <option value="">All</option>
                <option value="true">Fatal Only</option>
                <option value="false">Non-Fatal Only</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Search
              </label>
              <div className="relative">
                <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search error message..."
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
              Clear
            </button>
            <button
              onClick={() => { fetchCrashLogs(); fetchStats(); }}
              className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md flex items-center gap-2`}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Crash Logs Table */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>
                    Date
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>
                    Error
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>
                    Platform
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>
                    Version
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>
                    Screen
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                      <RefreshCw className="animate-spin inline mr-2" size={16} />
                      Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                      No crash logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          <div>
                            <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-start gap-2">
                          {getErrorTypeIcon(log.errorInfo?.errorType)}
                          <div className="max-w-xs">
                            <div className="font-medium truncate">
                              {log.errorInfo?.errorName || log.errorInfo?.errorType}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {log.errorInfo?.errorMessage?.substring(0, 60)}...
                            </div>
                            {log.errorInfo?.isFatal && (
                              <span className="text-xs text-red-500 font-medium">FATAL</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-1">
                          <span>{getOSIcon(log.osInfo?.osName)}</span>
                          <div>
                            <div className="capitalize">{log.osInfo?.osName}</div>
                            <div className="text-xs text-gray-500">{log.osInfo?.osVersion}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {log.appInfo?.appVersion || 'N/A'}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <Monitor size={14} className="mr-1 text-gray-400" />
                          {log.screenInfo?.currentScreen || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          value={log.status}
                          onChange={(e) => handleStatusUpdate(log._id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(log.status)} border-0 cursor-pointer`}
                        >
                          <option value="new">New</option>
                          <option value="investigating">Investigating</option>
                          <option value="resolved">Resolved</option>
                          <option value="ignored">Ignored</option>
                          <option value="duplicate">Duplicate</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => viewCrashDetails(log)}
                          className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={`px-4 py-3 flex items-center justify-between border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setFilters({...filters, page: filters.page - 1}); setTimeout(fetchCrashLogs, 100); }}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 rounded ${pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => { setFilters({...filters, page: filters.page + 1}); setTimeout(fetchCrashLogs, 100); }}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Crash Distribution */}
        {stats && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* By Error Type */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                By Error Type
              </h3>
              <div className="space-y-2">
                {stats.crashesByType?.slice(0, 6).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getErrorTypeIcon(item.type)}
                      <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.type?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Platform */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                By Platform
              </h3>
              <div className="space-y-2">
                {stats.crashesByOS?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{getOSIcon(item.os)}</span>
                      <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.os}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Crashing Screens */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Top Crashing Screens
              </h3>
              <div className="space-y-2">
                {stats.topCrashingScreens?.slice(0, 6).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor size={14} className="text-gray-400" />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.screen}
                      </span>
                    </div>
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

      {/* Crash Detail Modal */}
      {showDetailModal && selectedCrash && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 flex justify-between items-center`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Crash Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Error Info */}
              <div>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Error Information</h3>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-gray-500 text-sm">Type:</span>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedCrash.errorInfo?.errorType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Name:</span>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedCrash.errorInfo?.errorName}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Message:</span>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedCrash.errorInfo?.errorMessage}</p>
                  </div>
                </div>
              </div>

              {/* Stack Trace */}
              {selectedCrash.errorInfo?.stackTrace && (
                <div>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Stack Trace</h3>
                  <pre className={`${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'} rounded-lg p-4 text-xs overflow-x-auto`}>
                    {selectedCrash.errorInfo?.stackTrace}
                  </pre>
                </div>
              )}

              {/* Device & OS Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Device Info</h3>
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 space-y-2`}>
                    <p><span className="text-gray-500">Model:</span> {selectedCrash.deviceInfo?.deviceModel}</p>
                    <p><span className="text-gray-500">Manufacturer:</span> {selectedCrash.deviceInfo?.manufacturer}</p>
                    <p><span className="text-gray-500">Type:</span> {selectedCrash.deviceInfo?.deviceType}</p>
                  </div>
                </div>
                <div>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>OS & App Info</h3>
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 space-y-2`}>
                    <p><span className="text-gray-500">OS:</span> {selectedCrash.osInfo?.osName} {selectedCrash.osInfo?.osVersion}</p>
                    <p><span className="text-gray-500">App Version:</span> {selectedCrash.appInfo?.appVersion}</p>
                    <p><span className="text-gray-500">Build:</span> {selectedCrash.appInfo?.buildNumber}</p>
                  </div>
                </div>
              </div>

              {/* Breadcrumbs */}
              {selectedCrash.breadcrumbs?.length > 0 && (
                <div>
                  <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Steps Before Crash (Breadcrumbs)
                  </h3>
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-4 max-h-60 overflow-y-auto`}>
                    {selectedCrash.breadcrumbs.map((crumb, index) => (
                      <div key={index} className={`flex items-start gap-2 py-2 ${index > 0 ? 'border-t border-gray-600' : ''}`}>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(crumb.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          crumb.type === 'navigation' ? 'bg-blue-100 text-blue-800' :
                          crumb.type === 'action' ? 'bg-green-100 text-green-800' :
                          crumb.type === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {crumb.type}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {crumb.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrashLogsPage;
