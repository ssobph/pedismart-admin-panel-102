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
import RideHistoryPage from "./pages/RideHistoryPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import TripLogsPage from "./pages/TripLogsPage";
import RouteLogsPage from "./pages/RouteLogsPage";
import CheckpointMonitoringPage from "./pages/CheckpointMonitoringPage";
import AuthenticationLogsPage from "./pages/AuthenticationLogsPage";
import CrashLogsPage from "./pages/CrashLogsPage";
import FareManagementPage from "./pages/FareManagementPage";
import AdminLoginMonitoringPage from "./pages/AdminLoginMonitoringPage";

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
					<Route path="/rides" element={<RideHistoryPage />} />
					<Route path="/sales" element={<SalesPage />} />
					<Route path="/orders" element={<OrdersPage />} />
					<Route path="/analytics" element={<AnalyticsPage />} />
					<Route path="/trip-logs" element={<TripLogsPage />} />
					<Route path="/route-logs" element={<RouteLogsPage />} />
					<Route path="/checkpoint-monitoring" element={<CheckpointMonitoringPage />} />
					<Route path="/activity-log" element={<ActivityLogPage />} />
					<Route path="/authentication-logs" element={<AuthenticationLogsPage />} />
					<Route path="/crash-logs" element={<CrashLogsPage />} />
					<Route path="/fare-management" element={<FareManagementPage />} />
					<Route path="/admin-login-monitoring" element={<AdminLoginMonitoringPage />} />
					<Route path="/admin-management" element={<AdminManagementPage />} />
					<Route path="/settings" element={<SettingsPage />} />
				</Route>
			</Route>
			
			{/* Catch all route - redirect to login */}
			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	);
}

export default App;
