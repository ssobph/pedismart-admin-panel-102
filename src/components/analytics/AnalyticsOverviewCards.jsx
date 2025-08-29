import React from "react";
import { motion } from "framer-motion";
import { Users, Car, MapPin, DollarSign } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const AnalyticsOverviewCards = ({ data }) => {
  const { isDarkMode } = useTheme();
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Format distance
  const formatDistance = (value) => {
    return `${value.toFixed(1)} km`;
  };

  const cards = [
    {
      title: "Total Users",
      value: data.totalUsers || 0,
      icon: Users,
      color: "blue",
      description: `${data.userStats.gender.male.total || 0} male, ${
        data.userStats.gender.female.total || 0
      } female`,
    },
    {
      title: "Total Rides",
      value: data.totalRides || 0,
      icon: Car,
      color: "green",
      description: `${data.completedRides || 0} completed rides`,
    },
    {
      title: "Total Distance",
      value: formatDistance(data.totalDistance || 0),
      icon: MapPin,
      color: "purple",
      description: "Total distance traveled",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenue || 0),
      icon: DollarSign,
      color: "amber",
      description: "From completed rides",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`rounded-xl p-6 print:bg-white print:border print:border-gray-200 print:text-black transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-700 bg-opacity-50 backdrop-filter backdrop-blur-lg border border-gray-600' 
              : 'bg-white shadow-lg border border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium print:text-gray-600 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {card.title}
              </p>
              <p className={`mt-1 text-2xl font-semibold print:text-gray-900 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {card.value}
              </p>
            </div>
            <div
              className={`p-3 rounded-full bg-${card.color}-500 bg-opacity-20 print:bg-opacity-10`}
            >
              <card.icon
                className={`size-6 text-${card.color}-500 print:text-${card.color}-600`}
              />
            </div>
          </div>
          <p className={`mt-2 text-sm print:text-gray-600 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {card.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default AnalyticsOverviewCards;
