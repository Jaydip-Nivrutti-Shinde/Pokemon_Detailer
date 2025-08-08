// src/components/EvolutionChain.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function EvolutionChain({ pokemonId }) {
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvolutionChain = async () => {
      try {
        setLoading(true);
        // First get the species data
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
        const speciesData = await speciesRes.json();
        
        // Then get the evolution chain
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();
        
        // Process the evolution chain
        const chain = [];
        let current = evoData.chain;
        
        while (current) {
          const speciesId = current.species.url.split('/').slice(-2, -1)[0];
          const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${speciesId}`);
          const pokemonData = await pokemonRes.json();
          
          chain.push({
            id: pokemonData.id,
            name: pokemonData.name,
            image: pokemonData.sprites.other?.['official-artwork']?.front_default || 
                  pokemonData.sprites.front_default,
            types: pokemonData.types.map(t => t.type.name)
          });
          
          current = current.evolves_to[0];
        }
        
        setEvolutionChain(chain);
      } catch (error) {
        console.error("Error fetching evolution chain:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvolutionChain();
  }, [pokemonId]);

  if (loading) return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (evolutionChain.length === 0) return (
    <div className="text-center py-6 text-gray-500">
      No evolution data available
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="text-lg font-semibold mb-6">Evolution Chain</h3>
      <div className="flex flex-wrap justify-center gap-6">
        {evolutionChain.map((pokemon, index) => (
          <motion.div
            key={pokemon.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/pokemon/${pokemon.id}`)}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="relative">
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-24 h-24 object-contain group-hover:opacity-80 transition"
              />
              {index > 0 && (
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
            <span className="mt-2 font-medium capitalize">{pokemon.name}</span>
            <div className="flex gap-1 mt-1">
              {pokemon.types.map(type => (
                <span 
                  key={type} 
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    type === 'fire' ? 'bg-red-500' :
                    type === 'water' ? 'bg-blue-500' :
                    type === 'grass' ? 'bg-green-500' :
                    type === 'electric' ? 'bg-yellow-400' :
                    'bg-gray-400'
                  } text-white`}
                >
                  {type}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}