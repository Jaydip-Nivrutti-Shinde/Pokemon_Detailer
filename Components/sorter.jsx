import { motion } from "framer-motion";

export default function Sorter({ onSortChange }) {
  const sortOptions = [
    { value: "", label: "Default" },
    { value: "id-asc", label: "ID ↑" },
    { value: "id-desc", label: "ID ↓" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
    { value: "height-asc", label: "Height ↑" },
    { value: "height-desc", label: "Height ↓" },
    { value: "weight-asc", label: "Weight ↑" },
    { value: "weight-desc", label: "Weight ↓" },
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
      <div className="flex flex-wrap gap-2">
        {sortOptions.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSortChange(option.value)}
            className={`px-3 py-1 rounded-full text-sm ${
              !option.value ? "bg-gray-200" : "bg-blue-100 text-blue-800"
            } hover:bg-blue-200 transition`}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
