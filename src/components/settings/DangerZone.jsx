import { motion } from "framer-motion";
import { LogOut, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const DangerZone = () => {
	const { logout } = useAuth();
	const { isDarkMode } = useTheme();
	
	return (
		<motion.div
			className={`backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border mb-8 ${isDarkMode ? 'bg-red-900 bg-opacity-50 border-red-700' : 'bg-red-50 border-red-300'} transition-colors duration-300`}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<div className='flex items-center mb-4'>
				<div className="p-2 bg-red-600 rounded-lg mr-3">
					<LogOut className='text-white' size={20} />
				</div>
				<h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-300`}>
					Logout
				</h2>
			</div>
			
			<div className={`flex items-start space-x-3 mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-red-950 bg-opacity-30' : 'bg-red-100'} transition-colors duration-300`}>
				<AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
				<div>
					<p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
						End your session
					</p>
					<p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
						You will be logged out and redirected to the login page. Make sure to save any unsaved changes.
					</p>
				</div>
			</div>
			
			<button
				className='bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 w-full sm:w-auto flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
				onClick={logout}
			>
				<LogOut size={18} />
				<span>Logout</span>
			</button>
		</motion.div>
	);
};
export default DangerZone;
