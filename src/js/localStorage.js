const LOCAL_STORAGE_KEY = "pokemonData";

function saveDataToLocalStorage() {
  const pokemonData = {
    pokemonCache: pokemonCache,
    favorites: favorites,
    theme: document.documentElement.getAttribute("data-theme")
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pokemonData));
  } catch (error) {
    console.warn("Daten konnten nicht im LocalStorage gespeichert werden:", error);
  }
}

function parseStoredData(rawData) {
  try {
    return JSON.parse(rawData);
  } catch (error) {
    console.warn("Gespeicherte Daten konnten nicht ausgelesen werden:", error);
    return null;
  }
}

function applyStoredData(pokemonData) {
  fillPokemonCache(pokemonData.pokemonCache);
  fillFavorites(pokemonData.favorites);
  applyTheme(pokemonData.theme);
}

function loadDataFromLocalStorage() {
  const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!rawData) {
    return false;
  }

  const pokemonData = parseStoredData(rawData);
  if (!pokemonData) {
    return false;
  }

  applyStoredData(pokemonData);
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

function applyTheme(theme) {
  const darkButton = document.querySelector(".darkButton");

  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (darkButton) darkButton.textContent = "LIGHT";
  } else {
    document.documentElement.removeAttribute("data-theme");
    if (darkButton) darkButton.textContent = "DARK";
  }
}

function clearLocalStorage() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}