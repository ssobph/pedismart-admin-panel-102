import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock,
  Download,
  RefreshCw,
  Search,
  Calendar,
  Monitor,
  Globe,
  Clock,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import adminLoginAttemptService from '../services/adminLoginAttemptService';

const AdminLoginMonitoringPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    email: '',
    success: '',
    isBlocked: '',
    startDate: '',
    endDate: '',
  });
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    fetchAttempts();
    fetchStats();
  }, [pagination.page, filters]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const response = await adminLoginAttemptService.getLoginAttempts({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      
      setAttempts(response.attempts || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0,
      }));
    } catch (error) {
      console.error('Error fetching attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await adminLoginAttemptService.getLoginStats(
        filters.startDate,
        filters.endDate
      );
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleUnlock = async (email) => {
    if (!confirm(`Are you sure you want to unlock ${email}?`)) return;
    
    try {
      await adminLoginAttemptService.unlockEmail(email);
      fetchAttempts();
      fetchStats();
      alert(`${email} has been unlocked successfully`);
    } catch (error) {
      alert('Failed to unlock email');
    }
  };

  const handleExport = async () => {
    try {
      await adminLoginAttemptService.exportLoginAttempts(filters);
    } catch (error) {
      alert('Failed to export data');
    }
  };

  const handleRefresh = () => {
    fetchAttempts();
    fetchStats();
  };

  const getFailureReasonLabel = (reason) => {
    const labels = {
      INVALID_EMAIL: 'Invalid Email',
      INVALID_PASSWORD: 'Wrong Password',
      ACCOUNT_DEACTIVATED: 'Account Deactivated',
      ACCOUNT_LOCKED: 'Account Locked',
      TOO_MANY_ATTEMPTS: 'Too Many Attempts',
      SERVER_ERROR: 'Server Error',
    };
    return labels[reason] || reason || 'N/A';
  };

  const getFailureReasonColor = (reason) => {
    const colors = {
      INVALID_EMAIL: 'text-orange-500',
      INVALID_PASSWORD: 'text-red-500',
      ACCOUNT_DEACTIVATED: 'text-gray-500',
      ACCOUNT_LOCKED: 'text-purple-500',
      TOO_MANY_ATTEMPTS: 'text-red-600',
      SERVER_ERROR: 'text-yellow-500',
    };
    return colors[reason] || 'text-gray-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-600" />
            Admin Login Monitoring
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and monitor admin login attempts, detect suspicious activity
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAttempts}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successfulLogins}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedAttempts}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Blocked</p>
                <p className="text-2xl font-bold text-purple-600">{stats.blockedAttempts}</p>
              </div>
              <Lock className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.successRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unique IPs</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.uniqueIPs}</p>
              </div>
              <Globe className="w-8 h-8 text-cyan-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Currently Locked Accounts Alert */}
      {stats?.currentlyLocked?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Currently Locked Accounts ({stats.currentlyLocked.length})
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                These accounts are temporarily locked due to too many failed login attempts.
              </p>
              <div className="mt-3 space-y-2">
                {stats.currentlyLocked.map((locked, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{locked.email}</p>
                      <p className="text-xs text-gray-500">
                        {locked.failedAttempts} failed attempts • Unlocks at {new Date(locked.unlocksAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnlock(locked.email)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      <Unlock className="w-4 h-4" />
                      Unlock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.email}
                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                placeholder="Search by email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.success}
              onChange={(e) => setFilters({ ...filters, success: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option value="true">Successful</option>
              <option value="false">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Blocked
            </label>
            <select
              value={filters.isBlocked}
              onChange={(e) => setFilters({ ...filters, isBlocked: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option value="true">Blocked</option>
              <option value="false">Not Blocked</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Top Failed Emails & IPs */}
      {stats && (stats.topFailedEmails?.length > 0 || stats.topFailedIPs?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Failed Emails */}
          {stats.topFailedEmails?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                Top Failed Emails
              </h3>
              <div className="space-y-2">
                {stats.topFailedEmails.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item._id}</span>
                    <span className="text-sm font-medium text-red-600">{item.count} attempts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Failed IPs */}
          {stats.topFailedIPs?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-500" />
                Top Failed IPs
              </h3>
              <div className="space-y-2">
                {stats.topFailedIPs.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">{item._id}</span>
                    <span className="text-sm font-medium text-orange-600">{item.count} attempts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Login Attempts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Attempt #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : attempts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No login attempts found
                  </td>
                </tr>
              ) : (
                attempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(attempt.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(attempt.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {attempt.email}
                      </p>
                      {attempt.admin && (
                        <p className="text-xs text-gray-500">{attempt.admin.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {attempt.success ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                      {attempt.isBlocked && (
                        <span className="ml-1 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          <Lock className="w-3 h-3" />
                          Blocked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${getFailureReasonColor(attempt.failureReason)}`}>
                        {getFailureReasonLabel(attempt.failureReason)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${attempt.attemptNumber >= 5 ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                        {attempt.attemptNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {attempt.ipAddress || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {attempt.isBlocked && (
                        <button
                          onClick={() => handleUnlock(attempt.email)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          <Unlock className="w-3 h-3" />
                          Unlock
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLoginMonitoringPage;
