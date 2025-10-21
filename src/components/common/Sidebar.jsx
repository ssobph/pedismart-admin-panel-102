import { BarChart2, DollarSign, Menu, Settings, ShoppingBag, ShoppingCart, TrendingUp, Users, LogOut, Sun, Moon, Car, Shield, FileText } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const SIDEBAR_ITEMS = [
	{
		name: "Overview",
		icon: BarChart2,
		color: "#6366f1",
		href: "/",
	},
	// { name: "Products", icon: ShoppingBag, color: "#8B5CF6", href: "/products" },
	{ name: "User Management", icon: Users, color: "#EC4899", href: "/users" },
	{ name: "Ride History", icon: Car, color: "#10B981", href: "/rides" },
	//{ name: "Finance", icon: DollarSign, color: "#10B981", href: "/sales" },
	//{ name: "Orders", icon: ShoppingCart, color: "#F59E0B", href: "/orders" },
	{ name: "Analytics", icon: TrendingUp, color: "#3B82F6", href: "/analytics" },
	{ name: "Activity Log", icon: FileText, color: "#F59E0B", href: "/activity-log" },
	{ name: "Admin Management", icon: Shield, color: "#8B5CF6", href: "/admin-management", superAdminOnly: true },
	{ name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const { logout, currentUser } = useAuth();
	const { isDarkMode, toggleTheme } = useTheme();

	// Check if current user is super-admin
	const isSuperAdmin = currentUser?.role === 'super-admin' || currentUser?.adminRole === 'super-admin';

	// Filter sidebar items based on user role
	const filteredSidebarItems = SIDEBAR_ITEMS.filter(item => {
		if (item.superAdminOnly) {
			return isSuperAdmin;
		}
		return true;
	});

	return (
		<motion.div
			className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
				isSidebarOpen ? "w-64" : "w-20"
			}`}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div className={`h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 flex flex-col border-r transition-colors duration-300`}>
				{/* Hamburger menu button - always visible */}
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors max-w-fit mb-4`}
				>
					<Menu size={24} className={`${isDarkMode ? 'text-white' : 'text-gray-800'}`} />
				</motion.button>
				
				<AnimatePresence>
					{isSidebarOpen && (
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							className='flex flex-col items-center justify-center mb-2'
						>
							<img 
								src="/ecoride_logo1_nobg.png" 
								alt="Ecoride Admin Panel" 
								className='h-24 w-auto'
							/>
							{/* Admin Name Display */}
							{currentUser && (
								<div className={`mt-2 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
									<p className="text-xs font-medium">Welcome Admin</p>
									<p className="text-sm font-bold">{currentUser.name || currentUser.username}</p>
									{currentUser.role === 'super-admin' || currentUser.adminRole === 'super-admin' ? (
										<span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
											Super Admin
										</span>
									) : (
										<span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
											Admin
										</span>
									)}
								</div>
							)}
						</motion.div>
					)}
				</AnimatePresence>

				<nav className='mt-2 flex-grow'>
					{filteredSidebarItems.map((item) => (
						<Link key={item.href} to={item.href}>
							<motion.div className={`flex items-center p-4 text-sm font-medium rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors mb-2`}>
								<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
								<AnimatePresence>
									{isSidebarOpen && (
										<motion.span
											className={`ml-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
											initial={{ opacity: 0, width: 0 }}
											animate={{ opacity: 1, width: "auto" }}
											exit={{ opacity: 0, width: 0 }}
											transition={{ duration: 0.2, delay: 0.3 }}
										>
											{item.name}
										</motion.span>
									)}
								</AnimatePresence>
							</motion.div>
						</Link>
					))}
					
					{/* Theme toggle button as a nav item */}
					<button
						onClick={toggleTheme}
						className={`flex items-center p-4 text-sm font-medium rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors mb-2 w-full`}
						title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
					>
						{isDarkMode ? (
							<Sun size={20} className="text-yellow-300" style={{ minWidth: "20px" }} />
						) : (
							<Moon size={20} className="text-blue-600" style={{ minWidth: "20px" }} />
						)}
						<AnimatePresence>
							{isSidebarOpen && (
								<motion.span
									className={`ml-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									transition={{ duration: 0.2, delay: 0.3 }}
								>
									{isDarkMode ? "Light Mode" : "Dark Mode"}
								</motion.span>
							)}
						</AnimatePresence>
					</button>
				</nav>

				{/* Logout button */}
				<button 
					onClick={logout}
					className={`flex items-center p-4 text-sm font-medium rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors mt-auto`}
				>
					<LogOut size={20} style={{ color: "#EF4444", minWidth: "20px" }} />
					<AnimatePresence>
						{isSidebarOpen && (
							<motion.span
								className={`ml-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
								transition={{ duration: 0.2, delay: 0.3 }}
							>
								Logout
							</motion.span>
						)}
					</AnimatePresence>
				</button>
			</div>
		</motion.div>
	);
};
export default Sidebar;
