// src/components/fetchpokemon.js

let pokemonCache = null;

export async function fetchPokemons(limit = 1000) {
  // ✅ Return from cache if already fetched
  if (pokemonCache) {
    return pokemonCache;
  }

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
  const data = await res.json();

  const detailedData = await Promise.all(
    data.results.map(async (pokemon) => {
      const pokeRes = await fetch(pokemon.url);
      const pokeData = await pokeRes.json();

      return {
        id: pokeData.id,
        name: pokeData.name,
        image:
          pokeData.sprites.other?.dream_world?.front_default ||
          pokeData.sprites.front_default,
        type: pokeData.types.map((t) => t.type.name).join(", "),
        height: pokeData.height,
        weight: pokeData.weight,
        abilities: pokeData.abilities.map((a) => a.ability.name),
      };
    })
  );

  pokemonCache = detailedData; // ✅ Store in cache
  return detailedData;
}
