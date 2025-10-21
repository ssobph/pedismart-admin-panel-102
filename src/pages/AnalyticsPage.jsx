import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Download, Printer, RefreshCw } from "lucide-react";
import Header from "../components/common/Header";
import analyticsService from "../services/analyticsService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useTheme } from "../context/ThemeContext";

// Import our analytics components
import UserGenderChart from "../components/analytics/UserGenderChart";
import VehicleTypeChart from "../components/analytics/VehicleTypeChart";
import RideStatsChart from "../components/analytics/RideStatsChart";
import AnalyticsOverviewCards from "../components/analytics/AnalyticsOverviewCards";
import TimeFilter from "../components/analytics/TimeFilter";

// Import new enhanced analytics components
import TopPerformingRiders from "../components/analytics/TopPerformingRiders";
import RevenueTrendsChart from "../components/analytics/RevenueTrendsChart";
import PeakHoursAnalysis from "../components/analytics/PeakHoursAnalysis";
import PopularRoutes from "../components/analytics/PopularRoutes";

const AnalyticsPage = () => {
	const { isDarkMode } = useTheme();
	const [timeFilter, setTimeFilter] = useState("all");
	const [analyticsData, setAnalyticsData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const reportRef = useRef(null);

	// Debug function to check completed rides
	const debugCompletedRides = async () => {
		try {
			console.log('🔍 Debugging completed rides...');
			const debugData = await analyticsService.getCompletedRidesDebug();
			console.log('📊 Debug data:', debugData);
			alert(`Found ${debugData.totalCompletedRides} completed rides. Check console for details.`);
		} catch (err) {
			console.error("❌ Debug error:", err);
			alert('Debug failed. Check console for details.');
		}
	};

	// Fetch analytics data
	const fetchAnalyticsData = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await analyticsService.getCombinedAnalytics(timeFilter);
			setAnalyticsData(data);
		} catch (err) {
			console.error("Error fetching analytics data:", err);
			setError("Failed to load analytics data");
		} finally {
			setLoading(false);
		}
	};

	// Handle time filter change
	const handleTimeFilterChange = (filter) => {
		setTimeFilter(filter);
	};

	// Generate printable report
	const generateReport = async () => {
		if (!reportRef.current) return;

		try {
			// Create a canvas from the report section
			const canvas = await html2canvas(reportRef.current, {
				scale: 2,
				logging: false,
				useCORS: true,
				allowTaint: true,
			});

			// Convert canvas to image and download
			const image = canvas.toDataURL("image/png");
			const link = document.createElement("a");
			link.href = image;
			link.download = `pedismart-analytics-${timeFilter}-${new Date().toISOString().slice(0, 10)}.png`;
			link.click();
		} catch (err) {
			console.error("Error generating report:", err);
			alert("Failed to generate report. Please try again.");
		}
	};

	// Print report as PDF
	const printReport = async () => {
		if (!reportRef.current) return;

		try {
			// Create a canvas from the report section
			const canvas = await html2canvas(reportRef.current, {
				scale: 2,
				logging: false,
				useCORS: true,
				allowTaint: true,
			});

			// Get canvas dimensions
			const imgWidth = 210; // A4 width in mm
			const imgHeight = (canvas.height * imgWidth) / canvas.width;

			// Create PDF
			const pdf = new jsPDF({
				orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
				unit: 'mm',
				format: 'a4',
			});

			// Add image to PDF
			const imgData = canvas.toDataURL('image/png');
			pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

			// Save PDF
			pdf.save(`pedismart-analytics-${timeFilter}-${new Date().toISOString().slice(0, 10)}.pdf`);
		} catch (err) {
			console.error("Error generating PDF report:", err);
			alert("Failed to generate PDF report. Please try again.");
		}
	};

	// Fetch data when component mounts or time filter changes
	useEffect(() => {
		fetchAnalyticsData();
	}, [timeFilter]);

	return (
		<div className={`flex-1 overflow-auto relative z-10 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} print:bg-white print:text-black transition-colors duration-300`}>
			<Header title={"Analytics Dashboard"} />

			<main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
				{/* Controls section */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 print:hidden">
					<div>
						<h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>PediSmart Analytics</h1>
						<p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
							Comprehensive data on users, rides, and vehicle usage
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
						{/* Time filter */}
						<TimeFilter
							currentFilter={timeFilter}
							onFilterChange={handleTimeFilterChange}
						/>

						{/* Report actions */}
						<div className="flex gap-2">
							<button
								onClick={debugCompletedRides}
								className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
							>
								🔍 Debug Rides
							</button>
							<button
								onClick={fetchAnalyticsData}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
								disabled={loading}
							>
								<RefreshCw size={16} className={loading ? "animate-spin" : ""} />
								Refresh
							</button>
							<button
								onClick={generateReport}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
								disabled={loading || !analyticsData}
							>
								<Download size={16} />
								Save Report
							</button>
							<button
								onClick={printReport}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${isDarkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'}`}
								disabled={loading || !analyticsData}
							>
								<Printer size={16} />
								Print
							</button>
						</div>
					</div>
				</div>

				{/* Report content */}
				<div
					ref={reportRef}
					className={`rounded-xl p-6 print:bg-white print:shadow-none transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}
				>
					{/* Report header - only visible when printing */}
					<div className="hidden print:block mb-6">
						<h1 className="text-3xl font-bold text-center">PediSmart Analytics Report</h1>
						<p className="text-center text-gray-600">
							Generated on {new Date().toLocaleDateString()} for period:{" "}
							{timeFilter === "24h"
								? "Last 24 Hours"
								: timeFilter === "week"
								? "Last Week"
								: "Last Month"}
						</p>
					</div>

					{loading ? (
						<div className="flex justify-center items-center h-96">
							<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
						</div>
					) : error ? (
						<div className="flex justify-center items-center h-96">
							<div className="text-red-500 text-center">
								<p className="text-xl font-bold mb-2">Error</p>
								<p>{error}</p>
							</div>
						</div>
					) : analyticsData ? (
						<div className="space-y-8">
							{/* Overview cards */}
							<AnalyticsOverviewCards data={analyticsData} />


							{/* Revenue Trends Section */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className={`rounded-xl p-6 print:bg-white print:shadow print:border transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg' : 'bg-white shadow-lg border border-gray-200'}`}
							>
								<RevenueTrendsChart timeFilter={timeFilter} />
							</motion.div>

							{/* Top Performers and Analytics Grid */}
							<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
								{/* Top Performing Riders */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
									className={`xl:col-span-2 rounded-xl p-6 print:bg-white print:shadow print:border transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg' : 'bg-white shadow-lg border border-gray-200'}`}
								>
									<TopPerformingRiders timeFilter={timeFilter} />
								</motion.div>

								{/* User gender distribution chart */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4 }}
									className={`rounded-xl p-6 print:bg-white print:shadow print:border transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg' : 'bg-white shadow-lg border border-gray-200'}`}
								>
									<UserGenderChart data={analyticsData.userStats.gender} />
								</motion.div>
							</div>

							{/* Peak Hours and Popular Routes */}
							<div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
								{/* Peak Hours Analysis */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.5 }}
									className={`rounded-xl p-6 print:bg-white print:shadow print:border transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg' : 'bg-white shadow-lg border border-gray-200'}`}
								>
									<PeakHoursAnalysis timeFilter={timeFilter} />
								</motion.div>

								{/* Popular Routes */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.6 }}
									className={`rounded-xl p-6 print:bg-white print:shadow print:border transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg' : 'bg-white shadow-lg border border-gray-200'}`}
								>
									<PopularRoutes timeFilter={timeFilter} />
								</motion.div>
							</div>

							{/* Traditional Charts Section */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								{/* Vehicle type distribution chart */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.7 }}
									className={`rounded-xl p-6 print:bg-white print:shadow print:border transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg' : 'bg-white shadow-lg border border-gray-200'}`}
								>
									<VehicleTypeChart data={analyticsData.vehicleStats} />
								</motion.div>

								{/* Ride statistics chart */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.8 }}
									className={`rounded-xl p-6 print:bg-white print:shadow print:border transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg' : 'bg-white shadow-lg border border-gray-200'}`}
								>
									<RideStatsChart data={analyticsData} />
								</motion.div>
							</div>

							{/* Report footer - only visible when printing */}
							<div className="hidden print:block mt-8 pt-4 border-t border-gray-300">
								<p className="text-center text-gray-600">
									© {new Date().getFullYear()} PediSmart Admin Dashboard
								</p>
							</div>
						</div>
					) : (
						<div className="flex justify-center items-center h-96">
							<p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>No data available</p>
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default AnalyticsPage;
