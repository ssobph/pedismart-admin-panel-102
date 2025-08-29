import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
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
				<LogOut className='text-red-400 mr-3' size={24} />
				<h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-300`}>Log Out Account</h2>
			</div>
			<p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Log out Account and go back to login modal.</p>
			<button
				className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded 
      transition duration-200'
				onClick={logout}
			>
				Log out
			</button>
		</motion.div>
	);
};
export default DangerZone;
