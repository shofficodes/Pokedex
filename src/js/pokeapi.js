const BASE_URL = "https://pokeapi.co/api/v2/";

const pokemonCache = {};
let pokemonAmount = 0;

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: ${url} (${response.status})`);
  }

  return response.json();
}

async function getDataFromApi(pokemonAmount) {
  for (let i = 0; i < pokemonAmount; i++) {
    await getPokemon(i + 1);
  }
  for (let i = 0; i < Object.keys(pokemonCache).length; i++) {
    await getEvolutionData(pokemonCache[i + 1].pokemon_species_url, pokemonCache[i + 1].id);
  }
}

async function getPokemon(id) {
  if (pokemonCache[id]) {
    return pokemonCache[id];
  }

  const data = await fetchJson(`${BASE_URL}pokemon/${id}`);
  pokemonCache[id] = pokemonModel(data);
  return pokemonCache[id];
}

function getPokemonIdentity(data) {
  return {
    id: data.id,
    name: data.name,
    types: data.types.map(t => t.type.name),
    image: data.sprites.other["official-artwork"].front_default,
    species: data.species.name,
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map(a => a.ability.name)
  };
}

function getBaseStats(data) {
  const [hp, attack, defense, spAttack, spDefense, speed] = data.stats.map(stat => stat.base_stat);
  return { hp, attack, defense, sp_attack: spAttack, sp_defense: spDefense, speed };
}

function pokemonModel(data) {
  return {
    ...getPokemonIdentity(data),
    ...getBaseStats(data),
    pokemon_species_url: data.species.url,
    evolution_chain_url: "",
    evolution_chain: []
  };
}

async function getPokemonAmount() {
  if (pokemonAmount) {
    return pokemonAmount;
  }

  const data = await fetchJson(`${BASE_URL}pokemon`);
  pokemonAmount = data.count;
  return pokemonAmount;
}

async function getEvolutionData(pokemonSpeciesUrl, pokemonId) {
  const speciesData = await fetchJson(pokemonSpeciesUrl);
  pokemonCache[pokemonId].evolution_chain_url = speciesData.evolution_chain.url;

  const evolutionData = await fetchJson(speciesData.evolution_chain.url);
  pokemonCache[pokemonId].evolution_chain = getEvolutionChain(evolutionData);
}

function getNextStage(chainLink) {
  return chainLink.evolves_to[0] || null;
}

function buildStageEntry(chainLink) {
  return { id: extractIdFromUrl(chainLink.species.url), name: chainLink.species.name };
}

function getEvolutionChain(evolutionData) {
  const stage1 = evolutionData.chain;
  const chain = [buildStageEntry(stage1)];

  const stage2 = getNextStage(stage1);
  if (stage2) {
    chain.push(buildStageEntry(stage2));
    const stage3 = getNextStage(stage2);
    if (stage3) {
      chain.push(buildStageEntry(stage3));
    }
  }
  return chain;
}

function extractIdFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  const lastPart = parts[parts.length - 1];

  return Number(lastPart);
}