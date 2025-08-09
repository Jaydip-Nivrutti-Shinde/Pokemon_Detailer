import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tab } from "@headlessui/react";
import { motion } from "framer-motion";
import EvolutionChain from "../Components/evolution";

const YOUTUBE_API_KEY = process.env.REACT_APP_YT;
const POKEMON_TCG_API_KEY = process.env.REACT_APP_Poke;

const typeColors = {
  normal: "bg-gradient-to-br from-gray-400 to-gray-600 text-white",
  fire: "bg-gradient-to-br from-red-500 to-red-700 text-white",
  water: "bg-gradient-to-br from-blue-500 to-blue-700 text-white",
  electric: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black",
  grass: "bg-gradient-to-br from-green-500 to-green-700 text-white",
  ice: "bg-gradient-to-br from-cyan-300 to-cyan-600 text-black",
  fighting: "bg-gradient-to-br from-red-700 to-red-900 text-white",
  poison: "bg-gradient-to-br from-purple-600 to-purple-900 text-white",
  ground: "bg-gradient-to-br from-yellow-600 to-yellow-800 text-black",
  flying: "bg-gradient-to-br from-indigo-400 to-indigo-700 text-white",
  psychic: "bg-gradient-to-br from-pink-500 to-pink-700 text-white",
  bug: "bg-gradient-to-br from-lime-400 to-lime-600 text-black",
  rock: "bg-gradient-to-br from-yellow-700 to-yellow-900 text-white",
  ghost: "bg-gradient-to-br from-indigo-700 to-indigo-900 text-white",
  dragon: "bg-gradient-to-br from-indigo-800 to-indigo-900 text-white",
  dark: "bg-gradient-to-br from-gray-700 to-black text-white",
  steel: "bg-gradient-to-br from-gray-500 to-gray-700 text-white",
  fairy: "bg-gradient-to-br from-pink-300 to-pink-600 text-black",
};

function formatVersionSprites(obj) {
  if (!obj || typeof obj !== "object") return [];
  let images = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val && typeof val === "string") {
      images.push({ key, url: val });
    } else if (val && typeof val === "object") {
      images = images.concat(formatVersionSprites(val));
    }
  }
  return images;
}

const detailsCache = {};
const speciesCache = {};

export default function PokemonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMoves, setLoadingMoves] = useState(true);
  const [error, setError] = useState(null);

  const [videos, setVideos] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [movesDetails, setMovesDetails] = useState({});
  const [videoSearch, setVideoSearch] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        setLoadingMoves(true);
        setMovesDetails({});
        setVideos([]);
        setGallery([]);
        setSelectedImage(null);
        setVideoSearch("");
        setVideoLoading(false);
        setPlayingVideo(null);

        // Use cache if present
        let data;
        if (detailsCache[id]) {
          data = detailsCache[id];
        } else {
          const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          if (!pokemonRes.ok) throw new Error("Pokémon not found");
          data = await pokemonRes.json();
          detailsCache[id] = data;
        }
        setPokemon(data);

        // Species cache
        let speciesData;
        if (speciesCache[id]) {
          speciesData = speciesCache[id];
        } else {
          const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
          if (!speciesRes.ok) throw new Error("Pokémon species not found");
          speciesData = await speciesRes.json();
          speciesCache[id] = speciesData;
        }
        setSpecies(speciesData);

        let spriteGallery = [];

        // Basic sprites
        for (const key in data.sprites) {
          if (data.sprites[key] && typeof data.sprites[key] === "string") {
            spriteGallery.push({
              id: `sprite-${key}`,
              url: data.sprites[key],
              title: `${data.name} sprite ${key.replace(/_/g, " ")}`,
            });
          }
        }

        // Other artwork collections
        if (data.sprites.other) {
          for (const [sectionName, sectionObj] of Object.entries(data.sprites.other)) {
            for (const [key, val] of Object.entries(sectionObj)) {
              if (val && typeof val === "string") {
                spriteGallery.push({
                  id: `other-${sectionName}-${key}`,
                  url: val,
                  title: `${data.name} artwork ${sectionName.replace(/_/g, " ")} - ${key.replace(/_/g, " ")}`,
                });
              } else if (val && typeof val === "object") {
                const nestedImages = formatVersionSprites(val);
                nestedImages.forEach(({ key: nKey, url }) => {
                  spriteGallery.push({
                    id: `other-${sectionName}-${nKey}`,
                    url,
                    title: `${data.name} artwork ${sectionName.replace(/_/g, " ")} - ${nKey.replace(/_/g, " ")}`,
                  });
                });
              }
            }
          }
        }

        // Animated GIF sprites (gen V black-white)
        const genVAnimated = data.sprites.versions?.["generation-v"]?.["black-white"]?.animated;
        if (genVAnimated) {
          for (const [animationKey, animationUrl] of Object.entries(genVAnimated)) {
            if (animationUrl) {
              spriteGallery.push({
                id: `animated-${animationKey}`,
                url: animationUrl,
                title: `${data.name} animated sprite ${animationKey.replace(/_/g, " ")}`,
              });
            }
          }
        }

        setGallery(spriteGallery);

        // Fetch Pokémon TCG Cards
        let cardImages = [];
        try {
          const tcgRes = await fetch(
            `https://api.pokemontcg.io/v2/cards?q=name:${data.name}`,
            { headers: { "X-Api-Key": POKEMON_TCG_API_KEY } }
          );
          const tcgData = await tcgRes.json();
          if (tcgData?.data) {
            cardImages = tcgData.data.slice(0, 8).map((card) => ({
              id: `card-${card.id}`,
              url: card.images.large || card.images.small,
              title: `Card: ${card.name}`,
            }));
          }
        } catch (tcgErr) {
          console.warn("Pokémon TCG fetch failed:", tcgErr);
        }

        setGallery((prevGallery) => [...prevGallery, ...cardImages]);

        // Fetch YouTube videos related to Pokémon on first load
        await fetchYouTubeVideos(data.name);

        // Fetch detailed move info in background (optional)
        const moveDetailsPromises = data.moves.map(async (moveEntry) => {
          const moveName = moveEntry.move.name;
          try {
            const moveRes = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
            if (!moveRes.ok) return null;
            const moveData = await moveRes.json();
            return { name: moveName, data: moveData, learnMethods: moveEntry.version_group_details };
          } catch {
            return null;
          }
        });
        const resolvedMoves = await Promise.all(moveDetailsPromises);
        let movesMap = {};
        resolvedMoves.forEach((move) => {
          if (move) movesMap[move.name] = move;
        });
        setMovesDetails(movesMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setLoadingMoves(false);
      }
    }
    fetchData();
  }, [id]);

  async function fetchYouTubeVideos(pokemonName) {
    setVideoLoading(true);
    if (!YOUTUBE_API_KEY) {
      setVideos([
        {
          id: "1",
          title: `${pokemonName} battle highlights`,
          thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
          url: `https://www.youtube.com/embed/dQw4w9WgXcQ`,
        },
      ]);
      setVideoLoading(false);
      return;
    }
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(
      pokemonName + " battle anime"
    )}&key=${YOUTUBE_API_KEY}`;

    try {
      const resp = await fetch(url);
      const data = await resp.json();
      if (data && data.items) {
        // Shuffle for varied results
        const shuffled = data.items.sort(() => Math.random() - 0.5);
        setVideos(
          shuffled.map((item) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            url: `https://www.youtube.com/embed/${item.id.videoId}`,
          }))
        );
      }
    } catch {
      setVideos([]);
    }
    setVideoLoading(false);
  }

  async function handleVideoSearch(event) {
    event.preventDefault();
    if (!videoSearch.trim()) return;
    setVideoLoading(true);
    const searchQuery = videoSearch.trim() + " pokemon battle anime";
    if (!YOUTUBE_API_KEY) {
      setVideos([
        {
          id: "1",
          title: `${searchQuery} (default)`,
          thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
          url: `https://www.youtube.com/embed/dQw4w9WgXcQ`,
        },
      ]);
      setVideoLoading(false);
      return;
    }
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
        searchQuery
      )}&key=${YOUTUBE_API_KEY}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data && data.items) {
        setVideos(
          data.items.map((item) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            url: `https://www.youtube.com/embed/${item.id.videoId}`,
          }))
        );
      } else {
        setVideos([]);
      }
    } catch {
      setVideos([]);
    }
    setVideoLoading(false);
  }

  const playSound = () => {
    const audio = new Audio(
      `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
    );
    audio.play().catch(() => {});
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        <p className="text-xl font-semibold mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    );

  const primaryType = pokemon?.types[0]?.type?.name || "normal";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <motion.button
        whileHover={{ x: -6 }}
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-8 font-semibold"
        aria-label="Back to Pokédex"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Pokédex
      </motion.button>

      {/* Overview */}
      <div className={`rounded-2xl p-6 mb-10 shadow-lg bg-gradient-to-br ${typeColors[primaryType]}`}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <motion.img
            src={pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-56 h-56 object-contain rounded-xl shadow-xl"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 150 }}
            loading="lazy"
          />

          <div className="flex-1 text-white">
            <h1 className="capitalize text-5xl font-extrabold tracking-wide drop-shadow-lg">{pokemon.name}</h1>
            <p className="font-semibold text-xl mb-3 drop-shadow-md">
              #{pokemon.id.toString().padStart(3, "0")}
            </p>

            <div className="flex gap-3 mb-5">
              {pokemon.types.map(({ type }) => (
                <span key={type.name} className="px-4 py-1 rounded-full font-semibold bg-black bg-opacity-30 capitalize">
                  {type.name}
                </span>
              ))}
            </div>

            <div className="flex gap-6 font-semibold text-lg mb-6 drop-shadow-sm">
              <div>
                <p>Height</p>
                <p>{(pokemon.height / 10).toFixed(1)} m</p>
              </div>
              <div>
                <p>Weight</p>
                <p>{(pokemon.weight / 10).toFixed(1)} kg</p>
              </div>
            </div>

            <button
              onClick={playSound}
              className="inline-flex items-center gap-2 rounded-lg bg-white bg-opacity-90 hover:bg-opacity-100 px-5 py-2 font-semibold text-blue-700 shadow-lg transition"
              aria-label="Play Pokémon Cry"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" />
                <path
                  fillRule="evenodd"
                  d="M14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                  clipRule="evenodd"
                />
              </svg>
              Play Cry
            </button>
          </div>
        </div>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-2 bg-blue-50 p-1 rounded-xl shadow-inner">
          {["About", "Stats", "Evolution", "Moves", "Media"].map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `w-full py-3 font-semibold rounded-lg transition-colors duration-300 ${
                  selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:text-blue-800"
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-6 text-gray-700">
          {/* About Tab */}
          <Tab.Panel className="focus:outline-none bg-white rounded-xl p-6 shadow max-h-[450px] overflow-auto space-y-3">
            {species ? (
              <>
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <p className="italic whitespace-pre-line max-h-32 overflow-y-auto">
                  {species.flavor_text_entries.find((e) => e.language.name === "en")?.flavor_text.replace(/\f/g, " ") ||
                    "No description."}
                </p>
                <p><b>Genus: </b>{species.genera.find((g) => g.language.name === "en")?.genus || "Unknown"}</p>
                <p><b>Color: </b>{species.color.name}</p>
                <p><b>Habitat: </b>{species.habitat?.name || "Unknown"}</p>
                <p><b>Shape: </b>{species.shape?.name || "Unknown"}</p>
                <p><b>Capture Rate: </b>{species.capture_rate}</p>
                <p><b>Base Happiness: </b>{species.base_happiness}</p>
                <p><b>Growth Rate: </b>{species.growth_rate?.name || "Unknown"}</p>
                <p><b>Generation: </b>{species.generation?.name || "Unknown"}</p>
                <p><b>Egg Groups: </b>{species.egg_groups.map((g) => g.name).join(", ")}</p>
                <p><b>Legendary: </b>{species.is_legendary ? "Yes" : "No"}</p>
                <p><b>Mythical: </b>{species.is_mythical ? "Yes" : "No"}</p>
                <p><b>Ultra Beast: </b>{species.is_ultra_beast ? "Yes" : "No"}</p>
              </>
            ) : (
              <p>Loading about info...</p>
            )}
          </Tab.Panel>

          {/* Stats Tab */}
          <Tab.Panel className="focus:outline-none bg-white rounded-xl p-6 shadow max-h-[450px] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Base Stats</h3>
            {pokemon.stats.map((stat) => (
              <div key={stat.stat.name} className="flex items-center gap-4 mb-3">
                <p className="w-36 capitalize font-semibold">{stat.stat.name.replace("-", " ")}</p>
                <progress className="flex-1 rounded h-6" max="255" value={stat.base_stat} aria-label={`${stat.stat.name} stat`}>
                  {stat.base_stat}
                </progress>
                <span className="w-10 text-right font-semibold">{stat.base_stat}</span>
              </div>
            ))}
          </Tab.Panel>

          {/* Evolution Tab */}
          <Tab.Panel className="focus:outline-none bg-white rounded-xl p-6 shadow max-h-[450px] overflow-auto">
            <EvolutionChain pokemonId={id} />
          </Tab.Panel>

          {/* Moves Tab */}
          <Tab.Panel className="focus:outline-none bg-white rounded-xl p-6 shadow max-h-[450px] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Moves</h3>
            <div className="flex flex-wrap gap-2">
              {pokemon.moves.length > 0 ? (
                pokemon.moves.map((m) => (
                  <span key={m.move.name} className="px-3 py-1 bg-gray-100 rounded-full text-sm truncate capitalize">
                    {m.move.name.replace(/-/g, " ")}
                  </span>
                ))
              ) : (
                <p>No moves available.</p>
              )}
            </div>
          </Tab.Panel>

          {/* Media Tab */}
          <Tab.Panel className="focus:outline-none bg-white rounded-xl p-6 shadow space-y-8 min-h-[300px] overflow-auto max-h-[600px] text-gray-700">
            <section>
              <h3 className="text-lg font-semibold mb-4">Gallery (All Artwork, Sprites, GIFs, Cards)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.length > 0 ? (
                  gallery.map((media) => (
                    <motion.div
                      key={media.id}
                      whileHover={{ scale: 1.05 }}
                      className="relative rounded-lg overflow-hidden border border-gray-300 cursor-pointer"
                      onClick={() => setSelectedImage(media)}
                      title={media.title}
                    >
                      <img
                        src={media.url}
                        alt={media.title}
                        className="w-full h-28 object-contain bg-gray-100"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-image.png";
                        }}
                      />
                      <p className="p-1 text-xs text-center text-gray-700 truncate">{media.title}</p>

                      {/* Download Button Overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement("a");
                          link.href = media.url;
                          link.download = media.title.replace(/\s+/g, "_") + ".png";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-opacity-100 transition"
                        aria-label={`Download ${media.title}`}
                        title={`Download ${media.title}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v8m0 0l-4-4m4 4l4-4" />
                        </svg>
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <p>No media available.</p>
                )}
              </div>
            </section>

            {/* Videos Section */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Videos</h3>

              <form onSubmit={handleVideoSearch} className="mb-4 flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder={`Search videos related to ${pokemon?.name}`}
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Search YouTube videos"
                />
                <button
                  type="submit"
                  disabled={videoLoading}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:bg-blue-300"
                >
                  {videoLoading ? "Searching..." : "Search"}
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.length ? (
                  videos.map((video) => (
                    <motion.div
                      key={video.id}
                      className="rounded-lg overflow-hidden shadow-lg cursor-pointer"
                      whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(59,130,246,0.4)" }}
                      onClick={() => setPlayingVideo(video.id)}
                      title={video.title}
                    >
                      {playingVideo === video.id ? (
                        <iframe
                          src={`${video.url}?autoplay=1`}
                          title={video.title}
                          className="w-full h-56 rounded-lg"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-56 object-cover rounded-lg"
                          loading="lazy"
                        />
                      )}
                      <p className="p-3 font-semibold text-gray-800 truncate">{video.title}</p>
                    </motion.div>
                  ))
                ) : (
                  <p>No videos found.</p>
                )}
              </div>
            </section>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Image Modal */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-6"
          onClick={() => setSelectedImage(null)}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            className="relative max-w-5xl w-full bg-white rounded-lg overflow-hidden shadow-lg"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition"
              aria-label="Close Image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full max-h-[75vh] object-contain bg-gray-100"
              loading="lazy"
            />
            <p className="text-center p-4 font-semibold text-gray-800 bg-gray-50 truncate">{selectedImage.title}</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
