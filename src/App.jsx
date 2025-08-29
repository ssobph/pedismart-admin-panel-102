import { Route, Routes, Navigate, useLocation, Outlet } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { useTheme } from "./context/ThemeContext";

import OverviewPage from "./pages/OverviewPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";

// Layout component for authenticated pages
const DashboardLayout = () => {
	const { isDarkMode } = useTheme();

	return (
		<div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-dark-primary text-gray-100' : 'bg-light-primary text-gray-800'} transition-colors duration-300`}>
			{/* BG */}
			<div className='fixed inset-0 z-0 pointer-events-none'>
				<div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100'} opacity-80 transition-colors duration-300`} />
			</div>

			<Sidebar />
			<main className="flex-1 overflow-auto z-10">
				<Outlet />
			</main>
		</div>
	);
};

function App() {
	return (
		<Routes>
			{/* Public routes */}
			<Route path="/login" element={<LoginPage />} />
			
			{/* Protected routes using the new ProtectedRoute component */}
			<Route element={<ProtectedRoute />}>
				<Route element={<DashboardLayout />}>
					<Route path="/" element={<OverviewPage />} />
					<Route path="/users" element={<UsersPage />} />
					<Route path="/sales" element={<SalesPage />} />
					<Route path="/orders" element={<OrdersPage />} />
					<Route path="/analytics" element={<AnalyticsPage />} />
					<Route path="/settings" element={<SettingsPage />} />
				</Route>
			</Route>
			
			{/* Catch all route - redirect to login */}
			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	);
}

export default App;
