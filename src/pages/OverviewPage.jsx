import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCheck, UserPlus, UsersIcon, UserX, Car, MapPin, Loader, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { userService } from "../services/userService";
import { useTheme } from "../context/ThemeContext";

const StatCard = ({ name, icon: Icon, value, color }) => {
  const { isDarkMode } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-md shadow-lg rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 bg-opacity-50 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>{name}</p>
          <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>{value}</p>
        </div>
        <div
          className="p-3 rounded-full"
          style={{ backgroundColor: `${color}30`, color: color }}
        >
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

const OverviewPage = () => {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalPassengers: 0,
    approvedUsers: 0,
    unapprovedUsers: 0,
    loading: true,
    error: null
  });

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));
        
        // Fetch users for statistics
        const response = await userService.getAllUsers();
        console.log("Overview stats response:", response);
        const users = response.users || [];
        
        // Calculate statistics
        const totalUsers = users.length;
        const totalDrivers = users.filter(user => user.role === 'rider').length;
        const totalPassengers = users.filter(user => user.role === 'customer').length;
        const approvedUsers = users.filter(user => user.approved).length;
        const unapprovedUsers = totalUsers - approvedUsers;
        
        setStats({
          totalUsers,
          totalDrivers,
          totalPassengers,
          approvedUsers,
          unapprovedUsers,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setStats(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Failed to load statistics. Please try again later." 
        }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Dashboard Overview</h1>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
          Welcome to the EcoRide admin dashboard
        </p>
      </div>

      {stats.error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border p-4 rounded-md mb-6 flex items-center ${isDarkMode ? 'bg-red-500 bg-opacity-20 border-red-500 text-red-200' : 'bg-red-100 border-red-300 text-red-800'} transition-colors duration-300`}
        >
          <AlertCircle size={20} className="mr-2" />
          <span>{stats.error}</span>
        </motion.div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          name="Total Users"
          icon={UsersIcon}
          value={stats.loading ? <Loader size={24} className="animate-spin" /> : stats.totalUsers}
          color="#6366F1"
        />
        <StatCard 
          name="Total Drivers" 
          icon={Car} 
          value={stats.loading ? <Loader size={24} className="animate-spin" /> : stats.totalDrivers} 
          color="#10B981" 
        />
        <StatCard
          name="Total Passengers"
          icon={MapPin}
          value={stats.loading ? <Loader size={24} className="animate-spin" /> : stats.totalPassengers}
          color="#F59E0B"
        />
        <StatCard 
          name="Pending Approvals" 
          icon={UserX} 
          value={stats.loading ? <Loader size={24} className="animate-spin" /> : stats.unapprovedUsers} 
          color="#EF4444" 
        />
      </div>

      {/* WELCOME CARD */}
      <motion.div
        className={`backdrop-blur-md shadow-lg rounded-xl p-6 border mb-8 ${isDarkMode ? 'bg-gray-800 bg-opacity-50 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Welcome to EcoRide Admin Dashboard</h2>
        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
          This dashboard allows you to manage users, view statistics, and monitor the EcoRide platform.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-100'} transition-colors duration-300`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>Quick Actions</h3>
            <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
              <li>• <Link to="/users" className="text-blue-400 hover:underline">Manage Users</Link></li>
              <li>• <Link to="/settings" className="text-blue-400 hover:underline">System Settings</Link></li>
            </ul>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-100'} transition-colors duration-300`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>User Management</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
              You can approve new user registrations, manage existing users, and monitor user activity from the <Link to="/users" className="text-blue-400 hover:underline">Users</Link> page.
            </p>
          </div>
        </div>
      </motion.div>

      {/* SYSTEM STATUS */}
      <motion.div
        className={`backdrop-blur-md shadow-lg rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 bg-opacity-50 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`border p-4 rounded-lg ${isDarkMode ? 'bg-green-900 bg-opacity-30 border-green-700' : 'bg-green-100 border-green-300'} transition-colors duration-300`}>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <h3 className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'} transition-colors duration-300`}>Database</h3>
            </div>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>MongoDB connection is active and healthy.</p>
          </div>
          <div className={`border p-4 rounded-lg ${isDarkMode ? 'bg-green-900 bg-opacity-30 border-green-700' : 'bg-green-100 border-green-300'} transition-colors duration-300`}>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <h3 className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'} transition-colors duration-300`}>API Server</h3>
            </div>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Server is running and responding to requests.</p>
          </div>
          <div className={`border p-4 rounded-lg ${isDarkMode ? 'bg-green-900 bg-opacity-30 border-green-700' : 'bg-green-100 border-green-300'} transition-colors duration-300`}>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <h3 className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'} transition-colors duration-300`}>Authentication</h3>
            </div>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Authentication services are functioning properly.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewPage;
