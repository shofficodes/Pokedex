let renderAmount = null;
let favorites = [];

async function init() {
    const isInitialLoad = !renderAmount;

    if (isInitialLoad) {
        renderAmount = 24;
        loadDataFromLocalStorage();
        showPokeballLoader(true);
        consoleLog(true);
    }
    if (Object.keys(pokemonCache).length < renderAmount) {
        await getDataFromApi(renderAmount);
    }

    renderPokemons(renderAmount);
    await getPokemonAmount();
    initSearchInput();
    renderLoadedAmount();
    renderFavoriteCount();
    setLoadingState(false);

    if (isInitialLoad) {
        showPokeballLoader(false);
    }
    saveDataToLocalStorage();
}

function consoleLog(log) {
    if (log) {
        console.log("type 'testPokeballLoader()' to test the Pokeball Loader animation");
    }
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
    renderPokemons(renderAmount);
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

function getSearchResult(query) {
    const normalizedQuery = query.trim().toLowerCase();
    const pokemonElement = document.getElementById("pokemons");

    const matches = Object.values(pokemonCache).filter(pokemon =>
        pokemon.name.toLowerCase().includes(normalizedQuery)
    );

    pokemonElement.innerHTML = "";

    if (matches.length === 0) {
        pokemonElement.innerHTML = `<p data-id="not-found">No Pokémon found for "${query}"</p>`;
        return;
    }

    matches.forEach(pokemon => {
        pokemonElement.innerHTML += pokemonCardTemplate(pokemon.id);
    });
}

function showFavorites() {
    const favButton = document.getElementById("favButton");
    const isActive = favButton.classList.toggle("favButtonEnabled");

    if (isActive) {
        renderFavoritePokemons();
    } else {
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