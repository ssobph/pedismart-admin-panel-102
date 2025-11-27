import { BarChart2, Menu, Settings, TrendingUp, Users, LogOut, Sun, Moon, Car, Shield, FileText, ClipboardList, MapPin, Route, KeyRound, ChevronDown, ChevronRight, ScrollText, Bug, DollarSign, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// Grouped sidebar structure
const SIDEBAR_GROUPS = [
	{
		id: "main",
		name: "Main",
		items: [
			{ name: "Overview", icon: BarChart2, color: "#6366f1", href: "/" },
			{ name: "User Management", icon: Users, color: "#EC4899", href: "/users" },
			{ name: "Ride History", icon: Car, color: "#10B981", href: "/rides" },
			{ name: "Analytics", icon: TrendingUp, color: "#3B82F6", href: "/analytics" },
			{ name: "Fare Management", icon: DollarSign, color: "#10B981", href: "/fare-management" },
		]
	},
	{
		id: "logs",
		name: "Logs & Monitoring",
		icon: ScrollText,
		color: "#F59E0B",
		collapsible: true,
		items: [
			{ name: "Trip Logs", icon: ClipboardList, color: "#14B8A6", href: "/trip-logs" },
			{ name: "Route Logs", icon: Route, color: "#8B5CF6", href: "/route-logs" },
			{ name: "Checkpoint Monitor", icon: MapPin, color: "#EF4444", href: "/checkpoint-monitoring" },
			{ name: "Admin Activity Log", icon: FileText, color: "#F59E0B", href: "/activity-log" },
			{ name: "Auth Logs", icon: KeyRound, color: "#06B6D4", href: "/authentication-logs" },
			{ name: "Crash Logs", icon: Bug, color: "#EF4444", href: "/crash-logs" },
			{ name: "Admin Login Monitor", icon: ShieldAlert, color: "#7C3AED", href: "/admin-login-monitoring" },
		]
	},
	{
		id: "admin",
		name: "Administration",
		items: [
			{ name: "Admin Management", icon: Shield, color: "#8B5CF6", href: "/admin-management", superAdminOnly: true },
			{ name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
		]
	}
];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [expandedGroups, setExpandedGroups] = useState({ logs: true });
	const { logout, currentUser } = useAuth();
	const { isDarkMode, toggleTheme } = useTheme();
	const location = useLocation();

	// Check if current user is super-admin
	const isSuperAdmin = currentUser?.role === 'super-admin' || currentUser?.adminRole === 'super-admin';

	// Toggle group expansion
	const toggleGroup = (groupId) => {
		setExpandedGroups(prev => ({
			...prev,
			[groupId]: !prev[groupId]
		}));
	};

	// Check if current path is in a group
	const isPathInGroup = (group) => {
		return group.items.some(item => item.href === location.pathname);
	};

	// Filter items based on user role
	const filterItems = (items) => {
		return items.filter(item => {
			if (item.superAdminOnly) {
				return isSuperAdmin;
			}
			return true;
		});
	};

	// Render a single nav item
	const renderNavItem = (item, isNested = false) => {
		const isActive = location.pathname === item.href;
		
		return (
			<Link key={item.href} to={item.href}>
				<motion.div 
					className={`flex items-center ${isNested ? 'p-3 pl-8' : 'p-3'} text-sm font-medium rounded-lg ${
						isActive 
							? isDarkMode ? 'bg-gray-700' : 'bg-gray-200' 
							: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
					} transition-colors mb-1`}
				>
					<item.icon size={18} style={{ color: item.color, minWidth: "18px" }} />
					<AnimatePresence>
						{isSidebarOpen && (
							<motion.span
								className={`ml-3 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
								transition={{ duration: 0.2, delay: 0.2 }}
							>
								{item.name}
							</motion.span>
						)}
					</AnimatePresence>
				</motion.div>
			</Link>
		);
	};

	// Render a collapsible group
	const renderCollapsibleGroup = (group) => {
		const isExpanded = expandedGroups[group.id];
		const hasActiveItem = isPathInGroup(group);
		const filteredItems = filterItems(group.items);
		
		if (filteredItems.length === 0) return null;

		return (
			<div key={group.id} className="mb-1">
				<button
					onClick={() => toggleGroup(group.id)}
					className={`flex items-center justify-between w-full p-3 text-sm font-medium rounded-lg ${
						hasActiveItem && !isExpanded
							? isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
							: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
					} transition-colors`}
				>
					<div className="flex items-center">
						{group.icon && <group.icon size={18} style={{ color: group.color, minWidth: "18px" }} />}
						<AnimatePresence>
							{isSidebarOpen && (
								<motion.span
									className={`ml-3 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									transition={{ duration: 0.2, delay: 0.2 }}
								>
									{group.name}
								</motion.span>
							)}
						</AnimatePresence>
					</div>
					{isSidebarOpen && (
						<motion.div
							animate={{ rotate: isExpanded ? 180 : 0 }}
							transition={{ duration: 0.2 }}
						>
							<ChevronDown size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
						</motion.div>
					)}
				</button>
				
				<AnimatePresence>
					{isExpanded && isSidebarOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="overflow-hidden"
						>
							<div className={`mt-1 ml-2 pl-2 border-l-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
								{filteredItems.map(item => renderNavItem(item, true))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				
				{/* Show items when sidebar is collapsed */}
				{!isSidebarOpen && isExpanded && (
					<div className="mt-1">
						{filteredItems.map(item => renderNavItem(item, false))}
					</div>
				)}
			</div>
		);
	};

	return (
		<motion.div
			className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
				isSidebarOpen ? "w-64" : "w-20"
			}`}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div className={`h-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 flex flex-col border-r transition-colors duration-300 overflow-y-auto`}>
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
								src="/pedismart_logo.png" 
								alt="PediSmart Admin Panel" 
								className='h-20 w-auto'
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
					{SIDEBAR_GROUPS.map((group) => {
						const filteredItems = filterItems(group.items);
						if (filteredItems.length === 0) return null;

						// Render collapsible group
						if (group.collapsible) {
							return renderCollapsibleGroup(group);
						}

						// Render regular group (just items, no header for main)
						return (
							<div key={group.id} className="mb-2">
								{group.id !== 'main' && isSidebarOpen && (
									<div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
										{group.name}
									</div>
								)}
								{filteredItems.map(item => renderNavItem(item))}
							</div>
						);
					})}
					
					{/* Theme toggle button */}
					<button
						onClick={toggleTheme}
						className={`flex items-center p-3 text-sm font-medium rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors mb-1 w-full`}
						title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
					>
						{isDarkMode ? (
							<Sun size={18} className="text-yellow-300" style={{ minWidth: "18px" }} />
						) : (
							<Moon size={18} className="text-blue-600" style={{ minWidth: "18px" }} />
						)}
						<AnimatePresence>
							{isSidebarOpen && (
								<motion.span
									className={`ml-3 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
									initial={{ opacity: 0, width: 0 }}
									animate={{ opacity: 1, width: "auto" }}
									exit={{ opacity: 0, width: 0 }}
									transition={{ duration: 0.2, delay: 0.2 }}
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
					className={`flex items-center p-3 text-sm font-medium rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors mt-auto`}
				>
					<LogOut size={18} style={{ color: "#EF4444", minWidth: "18px" }} />
					<AnimatePresence>
						{isSidebarOpen && (
							<motion.span
								className={`ml-3 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: "auto" }}
								exit={{ opacity: 0, width: 0 }}
								transition={{ duration: 0.2, delay: 0.2 }}
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
