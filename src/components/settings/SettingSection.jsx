import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const SettingSection = ({ icon: Icon, title, children }) => {
	const { isDarkMode } = useTheme();
	return (
		<motion.div
			className={`backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border mb-8 ${isDarkMode ? 'bg-gray-800 bg-opacity-50 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300`}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className='flex items-center mb-4'>
				<Icon className='text-indigo-400 mr-4' size='24' />
				<h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-300`}>{title}</h2>
			</div>
			{children}
		</motion.div>
	);
};
export default SettingSection;
