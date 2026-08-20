const BASE_URL = "https://pokeapi.co/api/v2/";

const pokemonCache = {};

async function getDataFromApi(pokemonAmount){
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
    let response = await fetch(`${BASE_URL}pokemon/${id}`);
    let data = await response.json();

    pokemonCache[id] = pokemonModel(data);
    return pokemonCache[id];
}

function pokemonModel(data){
    return {
        id: data.id,
        name: data.name,
        types: data.types.map(t => t.type.name),
        image: data.sprites.other["official-artwork"].front_default,
        species: data.species.name,
        height: data.height,
        weight: data.weight,
        abilities: data.abilities.map(a => a.ability.name),
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        sp_attack: data.stats[3].base_stat,
        sp_defense: data.stats[4].base_stat,
        speed: data.stats[5].base_stat,
        pokemon_species_url: data.species.url,
        evolution_chain_url: "",
        evolution_chain: []
    };
}

async function getEvolutionData(pokemonSpeciesUrl, pokemonId) {
    let response = await fetch(pokemonSpeciesUrl);
    let data = await response.json();

    pokemonCache[pokemonId].evolution_chain_url = data.evolution_chain.url;
    
    let evolutionResponse = await fetch(data.evolution_chain.url);
    let evolutionData = await evolutionResponse.json();

    let chain = getEvolutionChain(evolutionData);
    
    pokemonCache[pokemonId].evolution_chain = chain;
}

function getEvolutionChain(evolutionData){
    let stage1 = evolutionData.chain;
    let chain = [
        { id: extractIdFromUrl(stage1.species.url), name: stage1.species.name }
    ];

    let stage2 = stage1.evolves_to[0];
    if (stage2) {
        chain.push({ id: extractIdFromUrl(stage2.species.url), name: stage2.species.name });

        let stage3 = stage2.evolves_to[0];
        if (stage3) {
            chain.push({ id: extractIdFromUrl(stage3.species.url), name: stage3.species.name });
        }
    }
    return chain;
}

function extractIdFromUrl(url) {
    const parts = url.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1];

    return Number(lastPart);
}

async function getPokemonImg(id) {
    let response = await fetch(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`);
}

