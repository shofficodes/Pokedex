const BATCH_SIZE = 24;

let renderAmount = null;
let favorites = [];

function prepareInitialLoad() {
  renderAmount = BATCH_SIZE;
  loadDataFromLocalStorage();
  showPokeballLoader(true);
}

async function loadPokemonBatch(cachedCountBefore) {
  try {
    if (cachedCountBefore < renderAmount) {
      await getDataFromApi(renderAmount);
    }
    return true;
  } catch (error) {
    console.warn("API-Request fehlgeschlagen:", error);
    handleApiError(Object.keys(pokemonCache).length);
    return false;
  }
}

function handleLoadFailure(isInitialLoad) {
  setLoadingState(false);
  if (isInitialLoad) {
    showPokeballLoader(false);
  }
}

async function finishSuccessfulLoad() {
  renderPokemons(renderAmount);
  await getPokemonAmount();
  initSearchInput();
  renderLoadedAmount();
  renderFavoriteCount();
  setLoadingState(false);
  setLoadMoreVisible(true);
  saveDataToLocalStorage();
}

function finishInitialLoadUi(isInitialLoad) {
  if (isInitialLoad) {
    showPokeballLoader(false);
  }
}

async function init() {
  const isInitialLoad = !renderAmount;
  if (isInitialLoad) {
    prepareInitialLoad();
  }
  const cachedCountBefore = Object.keys(pokemonCache).length;
  const success = await loadPokemonBatch(cachedCountBefore);
  if (!success) {
    handleLoadFailure(isInitialLoad);
    return;
  }
  await finishSuccessfulLoad();
  finishInitialLoadUi(isInitialLoad);
}

function handleApiError(cachedCountBefore) {
  renderAmount = cachedCountBefore;
  if (cachedCountBefore > 0) {
    renderPokemons(cachedCountBefore);
    appendApiErrorBox();
  } else {
    document.getElementById("pokemons").innerHTML = getApiErrorHtml();
  }
  setLoadMoreVisible(false);
}

function appendApiErrorBox() {
  document.getElementById("pokemons").innerHTML += getApiErrorHtml(true);
}

function dismissApiError(button) {
  button.closest(".apiErrorBox").remove();
  renderAmount = document.querySelectorAll(".pokemonCardWrapper").length;
  setLoadMoreVisible(true);
}

function retryFailedLoad() {
  init();
}

function renderPokemons(amount) {
  let pokemonElement = document.getElementById("pokemons");
  pokemonElement.innerHTML = "";

  for (let i = 0; i < amount; i++) {
    pokemonElement.innerHTML += pokemonCardTemplate(i + 1);
  }
}

function renderLoadedAmount() {
  document.getElementById("mainInfoLabel").textContent = "ALL POKÉMON";
  document.getElementById("mainInfoUnit").textContent = "LOADED";
  document.getElementById("loadedAmountCount").textContent = renderAmount;
  const loadedAmountTag = document.getElementById("loadedAmountInfo");
  loadedAmountTag.innerHTML = `${renderAmount} OF ${pokemonAmount} · NEXT BATCH ${BATCH_SIZE}`;
}

async function loadMorePokemon() {
  renderAmount += BATCH_SIZE;
  setLoadingState(true);
  await init();
}

function handleShortSearchInput(searchInput, searchButton, searchHint, length) {
  updateSearchHint(searchHint, length);
  disableSearchButton(searchButton);
  if (length === 0) {
    resetSearch();
  }
}

function handleValidSearchInput(searchInput, searchButton, searchHint) {
  updateSearchHint(searchHint, searchInput.value.length);
  enableSearchButton(searchButton);
  setLoadMoreVisible(false);
  getSearchResult(searchInput.value);
}

function handleSearchInputChange(searchInput, searchButton, searchHint) {
  const length = searchInput.value.length;
  if (length < 3) {
    handleShortSearchInput(searchInput, searchButton, searchHint, length);
    return;
  }
  handleValidSearchInput(searchInput, searchButton, searchHint);
}

function handleSearchEnterKey(event, searchInput) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchInput.blur();
  }
}

function initSearchInput() {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const searchHint = document.getElementById("searchHint");

  searchInput.addEventListener("input", () => handleSearchInputChange(searchInput, searchButton, searchHint));
  searchInput.addEventListener("keydown", (event) => handleSearchEnterKey(event, searchInput));
  searchButton.addEventListener("click", () => handleSearchButtonClick(searchInput));
}

function handleSearchButtonClick(searchInput) {
  searchInput.blur();
  getSearchResult(searchInput.value);
  setLoadMoreVisible(false);
}

function handleCardKeydown(event, pokeIndex) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openPokemonDialog(pokeIndex);
  }
}

function resetSearch() {
  setLoadMoreVisible(true);
  renderPokemons(renderAmount);
  renderLoadedAmount();
}

function setLoadMoreVisible(isVisible) {
  const loadMoreWrapper = document.querySelector(".loadMoreWrapper");
  const loadedAmountInfo = document.getElementById("loadedAmountInfo");

  loadMoreWrapper.classList.toggle("hidden", !isVisible);
  loadedAmountInfo.classList.toggle("hidden", !isVisible);
}

function enableSearchButton(button) {
  button.classList.add("searchButtonActive");
  button.disabled = false;
}

function disableSearchButton(button) {
  button.classList.remove("searchButtonActive");
  button.disabled = true;
}

const SEARCH_HINT_MESSAGES = {
  0: "TYPE AT LEAST 3 CHARACTERS",
  1: "2 MORE CHARACTERS TO SEARCH",
  2: "1 MORE CHARACTER TO SEARCH"
};

function getSearchHintMessage(length) {
  return SEARCH_HINT_MESSAGES[length] || "SHOWING LIVE RESULTS";
}

function updateSearchHint(hintElement, length) {
  hintElement.classList.remove("searchHintError");
  hintElement.textContent = getSearchHintMessage(length);
  hintElement.classList.toggle("searchHint", length >= 3);
}

function getMatchingPokemon(query) {
  const normalizedQuery = query.trim().toLowerCase();
  return Object.values(pokemonCache).filter(pokemon =>
    pokemon.name.toLowerCase().includes(normalizedQuery)
  );
}

function renderSearchMatches(matches) {
  const pokemonElement = document.getElementById("pokemons");
  let htmlContent = "";
  matches.forEach(pokemon => {
    htmlContent += pokemonCardTemplate(pokemon.id);
  });
  pokemonElement.innerHTML = htmlContent;
}

function updateSearchInfo(count) {
  document.getElementById("mainInfoLabel").textContent = "SEARCH RESULTS";
  document.getElementById("mainInfoUnit").textContent = "FOUND";
  document.getElementById("loadedAmountCount").textContent = count;
}

function getSearchResult(query) {
  const matches = getMatchingPokemon(query);
  updateSearchInfo(matches.length);

  if (matches.length === 0) {
    document.getElementById("pokemons").innerHTML = getNotFoundHtml();
    setLoadMoreVisible(false);
    return;
  }

  renderSearchMatches(matches);
}

function clearSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const searchHint = document.getElementById("searchHint");

  searchInput.value = "";
  updateSearchHint(searchHint, 0);
  disableSearchButton(searchButton);
  resetSearch();
}

function showFavorites() {
  const favButton = document.getElementById("favButton");
  const isActive = favButton.classList.toggle("favButtonEnabled");

  if (isActive) {
    setLoadMoreVisible(false);
    renderFavoritePokemons();
  } else {
    setLoadMoreVisible(true);
    renderPokemons(renderAmount);
    renderLoadedAmount();
  }
}

function updateFavoritesInfo(count) {
  document.getElementById("mainInfoLabel").textContent = "MY FAVORITES";
  document.getElementById("mainInfoUnit").textContent = "FAVORITES";
  document.getElementById("loadedAmountCount").textContent = count;
}

function renderFavoritePokemons() {
  const pokemonElement = document.getElementById("pokemons");
  const favoritedPokemon = favorites.filter(id => pokemonCache[id]);
  updateFavoritesInfo(favoritedPokemon.length);

  if (favoritedPokemon.length === 0) {
    pokemonElement.innerHTML = `<li class="notFoundBox" data-id="not-found">No favorites yet.</li>`;
    return;
  }
  let htmlContent = "";
  favoritedPokemon.forEach(id => {
    htmlContent += pokemonCardTemplate(id);
  });
  pokemonElement.innerHTML = htmlContent;
}

function toggleFavIcon(button) {
  const icon = button.querySelector(".cardFavIcon");
  icon.classList.toggle("cardFavIconActive");
}

function toggleFavorites(pokeIndex) {
  const index = favorites.indexOf(pokeIndex);

  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(pokeIndex);
  }

  renderFavoriteCount();
  saveDataToLocalStorage();
}

function renderFavoriteCount() {
  const favCountElement = document.querySelector("#favButton > span");
  favCountElement.textContent = favorites.length;
}

function setLoadingState(isLoading) {
  const button = document.getElementById("loadMoreButton");
  const infoText = document.getElementById("loadedAmountInfo");
  if (isLoading) {
    button.classList.add("isLoading");
    button.disabled = true;
    button.textContent = "LOADING";
    infoText.textContent = "FETCHING BATCH · BUTTON LOCKED";
  } else {
    button.classList.remove("isLoading");
    button.disabled = false;
    button.textContent = "LOAD MORE";
  }
}

function showPokeballLoader(isVisible) {
  const loader = document.getElementById("pokeballLoader");
  const pokemonSection = document.getElementById("pokemons");

  if (isVisible) {
    loader.classList.add("visible");
    pokemonSection.classList.add("hidden");
  } else {
    loader.classList.remove("visible");
    pokemonSection.classList.remove("hidden");
  }
}