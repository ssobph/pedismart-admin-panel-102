import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const VehicleTypeChart = ({ data }) => {
  const { isDarkMode } = useTheme();
  
  // Extract data for rider vehicle types (only Tricycle is active)
  // const motorcycleCount = data.riders["Single Motorcycle"] || 0; // Commented out: Only using Tricycle
  const tricycleCount = data.riders["Tricycle"] || 0;
  // const cabCount = data.riders["Cab"] || 0; // Commented out: Only using Tricycle
  
  // Extract data for ride vehicle types (only Tricycle is active)
  // const singleMotorcycleRides = data.rides["Single Motorcycle"]?.count || 0; // Commented out: Only using Tricycle
  const tricycleRides = data.rides["Tricycle"]?.count || 0;
  // const cabRides = data.rides["Cab"]?.count || 0; // Commented out: Only using Tricycle

  // Prepare chart data for rider vehicle types (only Tricycle is active)
  const riderChartData = {
    labels: ["Tricycle"], // Commented out: "Motorcycle", "Cab"
    datasets: [
      {
        label: "Rider Vehicle Types",
        data: [tricycleCount], // Commented out: motorcycleCount, cabCount
        backgroundColor: [
          // "rgba(255, 159, 64, 0.8)", // Commented out: Only using Tricycle
          "rgba(75, 192, 192, 0.8)",
          // "rgba(153, 102, 255, 0.8)", // Commented out: Only using Tricycle
        ],
        borderColor: [
          // "rgba(255, 159, 64, 1)", // Commented out: Only using Tricycle
          "rgba(75, 192, 192, 1)",
          // "rgba(153, 102, 255, 1)", // Commented out: Only using Tricycle
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for ride vehicle types (only Tricycle is active)
  const rideChartData = {
    labels: ["Tricycle"], // Commented out: "Single Motorcycle", "Cab"
    datasets: [
      {
        label: "Ride Vehicle Types",
        data: [tricycleRides], // Commented out: singleMotorcycleRides, cabRides
        backgroundColor: [
          // "rgba(255, 206, 86, 0.8)", // Commented out: Only using Tricycle
          "rgba(54, 162, 235, 0.8)",
          // "rgba(255, 99, 132, 0.8)", // Commented out: Only using Tricycle
          // "rgba(75, 192, 192, 0.8)", // Commented out: Only using Tricycle
        ],
        borderColor: [
          // "rgba(255, 206, 86, 1)", // Commented out: Only using Tricycle
          "rgba(54, 162, 235, 1)",
          // "rgba(255, 99, 132, 1)", // Commented out: Only using Tricycle
          // "rgba(75, 192, 192, 1)", // Commented out: Only using Tricycle
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: isDarkMode ? "white" : "#374151",
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="h-full">
      <h3 className={`text-lg font-semibold mb-4 print:text-gray-900 transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Vehicle Type Distribution
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className={`text-sm font-medium mb-2 text-center print:text-gray-600 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Rider Vehicle Types
          </h4>
          <div className="h-48">
            <Doughnut data={riderChartData} options={options} />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 text-center">
            {/* Commented out: Only using Tricycle */}
            {/* <div>
              <p className={`text-xs print:text-gray-600 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Motorcycle</p>
              <p className={`text-sm font-medium print:text-gray-900 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{motorcycleCount}</p>
            </div> */}
            <div>
              <p className={`text-xs print:text-gray-600 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Tricycle</p>
              <p className={`text-sm font-medium print:text-gray-900 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{tricycleCount}</p>
            </div>
            {/* Commented out: Only using Tricycle */}
            {/* <div>
              <p className={`text-xs print:text-gray-600 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Cab</p>
              <p className={`text-sm font-medium print:text-gray-900 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{cabCount}</p>
            </div> */}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className={`text-sm font-medium mb-2 text-center print:text-gray-600 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Ride Vehicle Types
          </h4>
          <div className="h-48">
            <Doughnut data={rideChartData} options={options} />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 text-center">
            {/* Commented out: Only using Tricycle */}
            {/* <div>
              <p className={`text-xs print:text-gray-600 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Single Motorcycle</p>
              <p className={`text-sm font-medium print:text-gray-900 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{singleMotorcycleRides}</p>
            </div> */}
            <div>
              <p className={`text-xs print:text-gray-600 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Tricycle</p>
              <p className={`text-sm font-medium print:text-gray-900 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{tricycleRides}</p>
            </div>
            {/* Commented out: Only using Tricycle */}
            {/* <div>
              <p className={`text-xs print:text-gray-600 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Cab</p>
              <p className={`text-sm font-medium print:text-gray-900 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{cabRides}</p>
            </div> */}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VehicleTypeChart;
