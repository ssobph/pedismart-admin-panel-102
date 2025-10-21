import { motion } from "framer-motion";
import { Calendar, Clock, Shield, CheckCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const AccountInfo = () => {
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuth();

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const accountCreated = formatDate(currentUser?.createdAt);
  const lastUpdated = formatDate(currentUser?.updatedAt);

  return (
    <motion.div
      className={`backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border mb-8 ${
        isDarkMode ? 'bg-gray-800 bg-opacity-50 border-gray-700' : 'bg-white border-gray-200'
      } transition-colors duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className='flex items-center mb-6'>
        <Shield className='text-indigo-400 mr-4' size='24' />
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-300`}>
          Account Information
        </h2>
      </div>

      <div className="space-y-4">
        {/* Account Status */}
        <div className={`flex items-center justify-between p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'
        } transition-colors duration-300`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900 bg-opacity-30' : 'bg-green-100'}`}>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Account Status
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Current account state
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>

        {/* Account Role */}
        <div className={`flex items-center justify-between p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'
        } transition-colors duration-300`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900 bg-opacity-30' : 'bg-indigo-100'}`}>
              <Shield className="text-indigo-500" size={20} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Account Role
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Your access level
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Administrator
          </span>
        </div>

        {/* Account Created */}
        <div className={`flex items-center justify-between p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'
        } transition-colors duration-300`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
              <Calendar className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={20} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Account Created
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Member since
              </p>
            </div>
          </div>
          <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {accountCreated}
          </span>
        </div>

        {/* Last Updated */}
        <div className={`flex items-center justify-between p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-50'
        } transition-colors duration-300`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
              <Clock className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={20} />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Last Updated
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Profile last modified
              </p>
            </div>
          </div>
          <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {lastUpdated}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountInfo;
