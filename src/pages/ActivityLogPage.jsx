import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, Calendar, User, FileText, Shield } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { adminManagementService } from "../services/adminManagementService";
import Header from "../components/common/Header";

const ActivityLogPage = () => {
  const { isDarkMode } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: "",
    targetType: "",
    startDate: "",
    endDate: "",
    limit: 100,
  });

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const response = await adminManagementService.getActivityLogs(filters);
      setLogs(response.logs || []);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      alert("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    fetchActivityLogs();
  };

  const clearFilters = () => {
    setFilters({
      action: "",
      targetType: "",
      startDate: "",
      endDate: "",
      limit: 100,
    });
    setTimeout(() => fetchActivityLogs(), 100);
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      APPROVED_USER: "bg-green-100 text-green-800",
      DISAPPROVED_USER: "bg-red-100 text-red-800",
      DELETED_USER: "bg-red-100 text-red-800",
      EDITED_USER: "bg-blue-100 text-blue-800",
      ADDED_PENALTY: "bg-orange-100 text-orange-800",
      REMOVED_PENALTY: "bg-green-100 text-green-800",
      CREATED_ADMIN: "bg-purple-100 text-purple-800",
      UPDATED_ADMIN: "bg-blue-100 text-blue-800",
      DELETED_ADMIN: "bg-red-100 text-red-800",
      DEACTIVATED_ADMIN: "bg-orange-100 text-orange-800",
      ACTIVATED_ADMIN: "bg-green-100 text-green-800",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  const formatActionName = (action) => {
    return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Activity Log" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Filters */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 mb-6`}>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Filters
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Action Type
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
              >
                <option value="">All Actions</option>
                <option value="APPROVED_USER">Approved User</option>
                <option value="DISAPPROVED_USER">Disapproved User</option>
                <option value="DELETED_USER">Deleted User</option>
                <option value="EDITED_USER">Edited User</option>
                <option value="ADDED_PENALTY">Added Penalty</option>
                <option value="REMOVED_PENALTY">Removed Penalty</option>
                <option value="CREATED_ADMIN">Created Admin</option>
                <option value="UPDATED_ADMIN">Updated Admin</option>
                <option value="DELETED_ADMIN">Deleted Admin</option>
                <option value="DEACTIVATED_ADMIN">Deactivated Admin</option>
                <option value="ACTIVATED_ADMIN">Activated Admin</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Target Type
              </label>
              <select
                value={filters.targetType}
                onChange={(e) => handleFilterChange("targetType", e.target.value)}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md`}
              >
                <option value="">All Types</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
                <option value="RIDE">Ride</option>
              </select>
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-md`}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Activity Log Table */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Date & Time
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Admin
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Action
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Target
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No activity logs found
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
                          <Shield size={16} className="mr-2 text-indigo-500" />
                          <div>
                            <div className="font-medium">{log.adminName}</div>
                            {log.admin?.username && (
                              <div className="text-xs text-gray-500">@{log.admin.username}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                          {formatActionName(log.action)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium">{log.targetName}</div>
                            <div className="text-xs text-gray-500">{log.targetType}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        <div className="flex items-start">
                          <FileText size={16} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                          <div className="max-w-md">{log.description}</div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Activities</div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {logs.length}
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>User Actions</div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {logs.filter((log) => log.targetType === "USER").length}
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Admin Actions</div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {logs.filter((log) => log.targetType === "ADMIN").length}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityLogPage;
