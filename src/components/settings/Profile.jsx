import { User } from "lucide-react";
import SettingSection from "./SettingSection";
import { useTheme } from "../../context/ThemeContext";

const Profile = () => {
	const { isDarkMode } = useTheme();
	return (
		<SettingSection icon={User} title={"Profile"}>
			<div className='flex flex-col sm:flex-row items-center mb-6'>
				<img
					src='/ecoride_logo.png'
					alt='Profile'
					className='rounded-full w-20 h-20 object-cover mr-4'
				/>

				<div>
					<h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-300`}>System Admin</h3>
					<p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>ecoride.admin@gmail.com</p>
				</div>
			</div>

			<button className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto'>
				Edit Profile
			</button>
		</SettingSection>
	);
};
export default Profile;
