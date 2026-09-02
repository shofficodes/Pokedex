let renderAmount = null;
let favorites = [];

async function init() {
    const isInitialLoad = !renderAmount;

    if (isInitialLoad) {
        renderAmount = 24;
        loadDataFromLocalStorage();
        showPokeballLoader(true);
    }

    const cachedCountBefore = Object.keys(pokemonCache).length;

    try {
        if (cachedCountBefore < renderAmount) {
            await getDataFromApi(renderAmount);
        }
    } catch (error) {
        console.warn("API-Request fehlgeschlagen:", error);
        handleApiError(Object.keys(pokemonCache).length);
        setLoadingState(false);
        if (isInitialLoad) {
            showPokeballLoader(false);
        }
        return;
    }

    renderPokemons(renderAmount);
    await getPokemonAmount();
    initSearchInput();
    renderLoadedAmount();
    renderFavoriteCount();
    setLoadingState(false);
    setLoadMoreVisible(true);

    if (isInitialLoad) {
        showPokeballLoader(false);
    }
    saveDataToLocalStorage();
}

function handleApiError(cachedCountBefore) {
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
    let loadedAmountTag = document.getElementById("loadedAmountInfo");
    loadedAmountTag.innerHTML = "";

    loadedAmountTag.innerHTML = `${renderAmount} OF ${pokemonAmount} · NEXT BATCH 24`;
}

async function loadMorePokemon() {
    renderAmount += 24;
    setLoadingState(true);
    await init();
}

function initSearchInput() {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const searchHint = document.getElementById("searchHint");

    searchInput.addEventListener("input", () => {
        const length = searchInput.value.length;
        updateSearchHint(searchHint, length);

        if (length === 0) {
            disableSearchButton(searchButton);
            resetSearch();
            return;
        }

        if (length < 3) {
            disableSearchButton(searchButton);
            return;
        }

        enableSearchButton(searchButton);
        setLoadMoreVisible(false);
        getSearchResult(searchInput.value);
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchInput.blur();
        }
    });

    searchButton.addEventListener("click", () => {
        searchInput.blur();
    });
}

function resetSearch() {
    setLoadMoreVisible(true);
    renderPokemons(renderAmount);
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

function updateSearchHint(hintElement, length) {
    hintElement.classList.remove("searchHintError");

    if (length === 0) {
        hintElement.textContent = "TYPE AT LEAST 3 CHARACTERS";
        hintElement.classList.remove("searchHint");
    } else if (length === 1) {
        hintElement.textContent = "2 MORE CHARACTERS TO SEARCH";
        hintElement.classList.remove("searchHint");
    } else if (length === 2) {
        hintElement.textContent = "1 MORE CHARACTER TO SEARCH";
        hintElement.classList.remove("searchHint");
    } else {
        hintElement.textContent = "SHOWING LIVE RESULTS";
        hintElement.classList.add("searchHint");
    }
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

function getSearchResult(query) {
    const matches = getMatchingPokemon(query);

    if (matches.length === 0) {
        document.getElementById("pokemons").innerHTML = getNotFoundHtml(query);
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
    }
}

function renderFavoritePokemons() {
    const pokemonElement = document.getElementById("pokemons");
    const favoritedPokemon = favorites.filter(id => pokemonCache[id]);

    if (favoritedPokemon.length === 0) {
        pokemonElement.innerHTML = `<p data-id="not-found">No favorites yet.</p>`;
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