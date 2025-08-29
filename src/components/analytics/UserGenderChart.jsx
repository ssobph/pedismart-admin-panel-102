import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const UserGenderChart = ({ data }) => {
  const { isDarkMode } = useTheme();
  
  // Calculate totals
  const maleTotal = data.male.total || 0;
  const femaleTotal = data.female.total || 0;
  const maleCustomers = data.male.customer || 0;
  const femaleCustomers = data.female.customer || 0;
  const maleRiders = data.male.rider || 0;
  const femaleRiders = data.female.rider || 0;

  // Prepare chart data
  const chartData = {
    labels: ["Male", "Female"],
    datasets: [
      {
        label: "Users by Gender",
        data: [maleTotal, femaleTotal],
        backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(255, 99, 132, 0.8)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
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
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = maleTotal + femaleTotal;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-full">
      <h3 className={`text-lg font-semibold mb-4 print:text-gray-900 transition-colors duration-300 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        User Gender Distribution
      </h3>
      
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 h-64">
          <Pie data={chartData} options={options} />
        </div>
        
        <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-6">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className={`text-sm font-medium print:text-blue-600 transition-colors duration-300 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                Male Users: {maleTotal}
              </h4>
              <div className="mt-1 flex items-center text-sm">
                <span className={`print:text-gray-600 mr-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Customers:
                </span>
                <span className={`print:text-gray-900 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {maleCustomers}
                </span>
              </div>
              <div className="mt-1 flex items-center text-sm">
                <span className={`print:text-gray-600 mr-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Riders:
                </span>
                <span className={`print:text-gray-900 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {maleRiders}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className={`text-sm font-medium print:text-pink-600 transition-colors duration-300 ${
                isDarkMode ? 'text-pink-400' : 'text-pink-600'
              }`}>
                Female Users: {femaleTotal}
              </h4>
              <div className="mt-1 flex items-center text-sm">
                <span className={`print:text-gray-600 mr-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Customers:
                </span>
                <span className={`print:text-gray-900 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {femaleCustomers}
                </span>
              </div>
              <div className="mt-1 flex items-center text-sm">
                <span className={`print:text-gray-600 mr-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Riders:
                </span>
                <span className={`print:text-gray-900 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {femaleRiders}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGenderChart;
