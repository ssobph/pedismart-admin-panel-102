import { useState, useEffect } from "react";
import { User, Mail, Edit2, Shield } from "lucide-react";
import SettingSection from "./SettingSection";
import EditProfileModal from "./EditProfileModal";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";

const Profile = () => {
	const { isDarkMode } = useTheme();
	const { currentUser, updateUser } = useAuth();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [profileData, setProfileData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch profile data on mount
	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const data = await userService.getProfile();
				setProfileData(data);
			} catch (error) {
				console.error('Error fetching profile:', error);
				// Fallback to currentUser from context
				setProfileData(currentUser);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfile();
	}, [currentUser]);

	const handleSaveProfile = async (formData) => {
		try {
			const updatedUser = await userService.updateProfile(formData);
			setProfileData(updatedUser);
			
			// Update user in context
			if (updateUser) {
				updateUser(updatedUser);
			}
			
			// Update localStorage
			localStorage.setItem('admin_user', JSON.stringify(updatedUser));
		} catch (error) {
			console.error('Error saving profile:', error);
			throw error;
		}
	};

	const displayName = profileData 
		? profileData.name || 'System Admin'
		: 'System Admin';

	const displayEmail = profileData?.email || currentUser?.email || 'pedismart.admin@gmail.com';

	return (
		<>
			<SettingSection icon={User} title={"Profile"}>
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
					</div>
				) : (
					<>
						{/* Profile Header */}
						<div className='flex flex-col sm:flex-row items-center mb-6'>
							<div className="relative mb-4 sm:mb-0 sm:mr-6">
								<img
									src='/pedismart_logo.png'
									alt='Profile'
									className='rounded-full w-24 h-24 object-cover border-4 border-indigo-600 shadow-lg'
								/>
								<div className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1.5 border-2 border-white shadow-lg">
									<Shield className="text-white" size={16} />
								</div>
							</div>

							<div className="flex-1 text-center sm:text-left">
								<h3 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-300`}>
									{displayName}
								</h3>
								<div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
									<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 ${isDarkMode ? 'bg-indigo-900 text-indigo-200' : ''}`}>
										<Shield className="mr-1" size={12} />
										Administrator
									</span>
								</div>
							</div>
						</div>

						{/* Profile Details */}
						<div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 bg-opacity-30' : 'bg-gray-50'} transition-colors duration-300`}>
							<div className="flex items-start space-x-3">
								<div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'} transition-colors duration-300`}>
									<Mail className={`${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} size={20} />
								</div>
								<div>
									<p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Email Address</p>
									<p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} transition-colors duration-300`}>{displayEmail}</p>
								</div>
							</div>
						</div>

						{/* Edit Button */}
						<button 
							onClick={() => setIsEditModalOpen(true)}
							className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 w-full sm:w-auto flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
						>
							<Edit2 size={18} />
							<span>Edit Profile</span>
						</button>
					</>
				)}
			</SettingSection>

			{/* Edit Profile Modal */}
			<EditProfileModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				currentUser={profileData || currentUser}
				onSave={handleSaveProfile}
			/>
		</>
	);
};
export default Profile;
