// src/components/Filters.jsx
import { motion } from "framer-motion";

export default function Filters({ types, selectedType, onTypeChange }) {
  const typeColors = {
    normal: "bg-gray-400",
    fire: "bg-red-500",
    water: "bg-blue-500",
    electric: "bg-yellow-400",
    grass: "bg-green-500",
    // ... other types
  };

  return (
    <div className="w-full md:w-auto">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Filter by Type
      </label>
      <motion.select
        whileHover={{ scale: 1.02 }}
        whileFocus={{ scale: 1.02 }}
        className="block w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        <option value="">All Types</option>
        {types.map((type) => (
          <option key={type} value={type} className={typeColors[type.toLowerCase()]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </motion.select>
    </div>
  );
}