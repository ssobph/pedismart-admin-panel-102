import { useTheme } from "../../context/ThemeContext";

const Header = ({ title }) => {
	const { isDarkMode } = useTheme();
	return (
		<header className={`shadow-lg border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300`}>
			<div className='max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8'>
				<h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-300`}>{title}</h1>
			</div>
		</header>
	);
};
export default Header;
