import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RideStatsChart = ({ data }) => {
  const { isDarkMode } = useTheme();
  
  // Extract ride data by vehicle type
  const vehicleTypes = ["Single Motorcycle", "Tricycle", "Cab"];
  const vehicleLabels = ["Single Motorcycle", "Tricycle", "Cab"];
  
  // Format data for rides count
  const ridesCountData = vehicleTypes.map(
    (type) => data.vehicleStats.rides[type]?.count || 0
  );
  
  // Format data for distance
  const distanceData = vehicleTypes.map(
    (type) => data.vehicleStats.rides[type]?.totalDistance || 0
  );

  // Prepare chart data
  const chartData = {
    labels: vehicleLabels,
    datasets: [
      {
        label: "Number of Rides",
        data: ridesCountData,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
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
        position: "top",
        labels: {
          color: isDarkMode ? "white" : "#374151",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
        text: "Ride Statistics by Vehicle Type",
        color: isDarkMode ? "white" : "#374151",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(55, 65, 81, 0.7)",
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(55, 65, 81, 0.1)",
        },
      },
      x: {
        ticks: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(55, 65, 81, 0.7)",
        },
        grid: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(55, 65, 81, 0.1)",
        },
      },
    },
  };

  // Format distance
  const formatDistance = (value) => {
    return `${value.toFixed(1)} km`;
  };

  return (
    <div className="h-full">
      <h3 className={`text-lg font-semibold mb-4 print:text-gray-900 transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Ride Statistics by Vehicle Type
      </h3>

      <div className="grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="h-64"
        >
          <Bar data={chartData} options={options} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="overflow-x-auto">
            <table className={`w-full text-sm text-left print:text-gray-800 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <thead className={`text-xs uppercase print:bg-gray-100 print:text-gray-700 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-700'
              }`}>
                <tr>
                  <th className="px-4 py-3">Vehicle Type</th>
                  <th className="px-4 py-3">Rides</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3">Avg. Distance</th>
                </tr>
              </thead>
              <tbody>
                {vehicleTypes.map((type, index) => {
                  const rides = data.vehicleStats.rides[type]?.count || 0;
                  const distance = data.vehicleStats.rides[type]?.totalDistance || 0;
                  const avgDistance = rides > 0 ? distance / rides : 0;

                  return (
                    <tr
                      key={type}
                      className={`border-b print:border-gray-200 transition-colors duration-300 ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">{vehicleLabels[index]}</td>
                      <td className="px-4 py-3">{rides}</td>
                      <td className="px-4 py-3">{formatDistance(distance)}</td>
                      <td className="px-4 py-3">{formatDistance(avgDistance)}</td>
                    </tr>
                  );
                })}
                <tr className={`font-medium print:bg-gray-100 transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3">{data.totalRides || 0}</td>
                  <td className="px-4 py-3">{formatDistance(data.totalDistance || 0)}</td>
                  <td className="px-4 py-3">
                    {formatDistance(
                      data.completedRides > 0
                        ? (data.totalDistance || 0) / (data.completedRides || 1)
                        : 0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RideStatsChart;
