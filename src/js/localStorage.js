const localStorageKey = "pokemonData";

function saveDataToLocalStorage() {
    const pokemonData = {
        pokemonCache: pokemonCache,
        favorites: favorites
    };

    try {
        localStorage.setItem(localStorageKey, JSON.stringify(pokemonData));
    } catch (error) {
        console.warn("Daten konnten nicht im LocalStorage gespeichert werden:", error);
    }
}

function loadDataFromLocalStorage() {
    const rawData = localStorage.getItem(localStorageKey);

    if (!rawData) {
        return false;
    }

    let pokemonData;
    try {
        pokemonData = JSON.parse(rawData);
    } catch (error) {
        console.warn("Gespeicherte Daten konnten nicht ausgelesen werden:", error);
        return false;
    }

    fillPokemonCache(pokemonData.pokemonCache);
    fillFavorites(pokemonData.favorites);

    return true;
}

function fillPokemonCache(loadedCache) {
    if (!loadedCache) {
        return;
    }

    for (const id in loadedCache) {
        pokemonCache[id] = loadedCache[id];
    }
}

function fillFavorites(loadedFavorites) {
    if (!loadedFavorites) {
        return;
    }

    favorites.length = 0;
    favorites.push(...loadedFavorites);
}

function clearLocalStorage() {
    localStorage.removeItem(localStorageKey);
}