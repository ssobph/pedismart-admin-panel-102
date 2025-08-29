import React from "react";
import { motion } from "framer-motion";

const TimeFilter = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { id: "24h", label: "Last 24 Hours" },
    { id: "week", label: "Last Week" },
    { id: "month", label: "Last Month" },
  ];

  return (
    <div className="flex items-center bg-gray-700 rounded-lg p-1">
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentFilter === filter.id
              ? "bg-blue-600 text-white"
              : "text-gray-300 hover:text-white"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
};

export default TimeFilter;
