// src/components/PokeCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, Loader } from "lucide-react";
import { motion } from "framer-motion";

const typeColors = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-blue-200",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-green-400",
  rock: "bg-yellow-700",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-600",
  dark: "bg-gray-800",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
};

export default function PokeCard({ id, name, image, type, shinyMode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const navigate = useNavigate();

  const playSound = async () => {
    setLoadingAudio(true);
    try {
      const audio = new Audio(
        `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
      );
      audio.currentTime = 0;
      await audio.play();
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    } catch (err) {
      console.error("Audio play error", err);
    } finally {
      setLoadingAudio(false);
    }
  };

  const primaryType = type?.split(", ")[0]?.toLowerCase() || "normal";

  const animatedGifUrl = shinyMode
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${id}.gif`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        y: -8,
        scale: 1.1,
        boxShadow: "0 8px 15px rgba(59,130,246,0.5)",
        rotateY: 10,
      }}
      className={`rounded-xl overflow-hidden shadow-lg ${
        typeColors[primaryType] || "bg-gray-200"
      } bg-opacity-25 backdrop-blur-sm border border-gray-100 cursor-pointer`}
      onClick={() => navigate(`/pokemon/${id}`)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <span className="text-gray-600 font-semibold">
            #{id.toString().padStart(3, "0")}
          </span>
          <div className="flex space-x-1">
            {type.split(", ").map((t) => (
              <span
                key={t}
                className={`px-2 py-1 text-xs rounded-full ${
                  typeColors[t.toLowerCase()] || "bg-gray-400"
                } text-white`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center my-4">
          <motion.img
            src={animatedGifUrl}
            alt={name}
            onError={(e) => {
              e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
            }}
            className="w-32 h-32 object-contain hover:scale-110 transition-transform"
            whileHover={{ scale: 1.1 }}
            loading="lazy"
          />
        </div>

        <h2 className="text-xl font-bold capitalize text-center mb-2 text-gray-800">
          {name}
        </h2>

        <div className="flex justify-center gap-3 mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/pokemon/${id}`);
            }}
          >
            <span>Details</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              playSound();
            }}
            className={`p-2 rounded-full ${
              isPlaying ? "bg-blue-100" : "bg-white"
            } shadow hover:bg-gray-100 transition`}
            disabled={loadingAudio}
          >
            {loadingAudio ? (
              <Loader className="animate-spin h-5 w-5 text-blue-500" />
            ) : (
              <PlayCircle className="h-5 w-5 text-blue-500" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
