// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { fetchPokemons } from "../Components/fetchpokemon";
import PokeCard from "../Components/pokecard";
import Filters from "../Components/filters";
import Sorter from "../Components/sorter";
import ShimmerCard from "../Components/shimmer";
import { motion } from "framer-motion";

let cachedPokemons = null; // Local cache

export default function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (cachedPokemons) {
          setPokemons(cachedPokemons);
          setFilteredPokemons(cachedPokemons);
          setLoading(false);
          return;
        }

        const data = await fetchPokemons();
        cachedPokemons = data;
        setPokemons(data);
        setFilteredPokemons(data);
      } catch (error) {
        console.error("Failed to load Pokémon data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Full API search handler
  const handleFullSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      setLoading(true);
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`
      );
      if (!res.ok) {
        alert("Pokémon not found");
        return;
      }
      const data = await res.json();
      const singlePokemon = {
        id: data.id,
        name: data.name,
        image:
          data.sprites.other?.dream_world?.front_default ||
          data.sprites.front_default,
        type: data.types.map((t) => t.type.name).join(", "),
        height: data.height,
        weight: data.weight,
        abilities: data.abilities.map((a) => a.ability.name),
      };
      setFilteredPokemons([singlePokemon]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter, search, sort locally for cached list
  useEffect(() => {
    let results = [...pokemons];

    if (searchTerm && filteredPokemons.length !== 1) {
      results = results.filter((poke) =>
        poke.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      results = results.filter((poke) =>
        poke.type.toLowerCase().includes(selectedType.toLowerCase())
      );
    }

    if (sortOption) {
      const [field, direction] = sortOption.split("-");
      results.sort((a, b) => {
        if (field === "name" || field === "type") {
          return direction === "asc"
            ? a[field].localeCompare(b[field])
            : b[field].localeCompare(a[field]);
        } else if (field === "abilities") {
          const aCount = a.abilities?.length || 0;
          const bCount = b.abilities?.length || 0;
          return direction === "asc" ? aCount - bCount : bCount - aCount;
        } else if (field === "height" || field === "weight") {
          return direction === "asc" ? a[field] - b[field] : b[field] - a[field];
        } else if (field === "id") {
          return direction === "asc" ? a.id - b.id : b.id - a.id;
        }
        return 0;
      });
    }

    setFilteredPokemons(results);
  }, [searchTerm, selectedType, sortOption, pokemons]);

  const allTypes = Array.from(
    new Set(pokemons.flatMap((poke) => poke.type?.split(", ") || []))
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Pokémon Explorer
          </h1>
          <p className="text-gray-600">Discover your favorite Pokémon!</p>
        </motion.div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/2 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Pokémon by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <span className="absolute right-3 top-2 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </div>
            <button
              onClick={handleFullSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
              API Search
            </button>
          </div>

          <Filters
            types={allTypes}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>

        <Sorter onSortChange={setSortOption} />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <ShimmerCard key={index} />
            ))}
          </div>
        ) : filteredPokemons.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {filteredPokemons.map((pokemon) => (
              <PokeCard
                key={pokemon.id}
                id={pokemon.id}
                name={pokemon.name}
                image={pokemon.image}
                type={pokemon.type}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No Pokémon found matching your criteria
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedType("");
                setSortOption("");
                setFilteredPokemons(pokemons);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
