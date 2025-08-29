import Header from "../components/common/Header";
import ConnectedAccounts from "../components/settings/ConnectedAccounts";
import DangerZone from "../components/settings/DangerZone";
import Notifications from "../components/settings/Notifications";
import Profile from "../components/settings/Profile";
import Security from "../components/settings/Security";
import { useTheme } from "../context/ThemeContext";

const SettingsPage = () => {
	const { isDarkMode } = useTheme();
	
	return (
		<div className={`flex-1 overflow-auto relative z-10 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
			<Header title='Settings' />
			<main className='max-w-4xl mx-auto py-6 px-4 lg:px-8'>
				<Profile />
				{/* <Notifications /> */}
				{/* <Security />
				<ConnectedAccounts /> */}
				<DangerZone /> 
			</main>
		</div>
	);
};
export default SettingsPage;
