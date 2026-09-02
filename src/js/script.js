let renderAmount = null;

async function init() {
    const isInitialLoad = !renderAmount;

    if (isInitialLoad){
        renderAmount = 24;
        showPokeballLoader(true);
    }

    await getDataFromApi(renderAmount);

    console.log(pokemonCache);

    renderPokemons(renderAmount);
    await getPokemonAmount();
    initSearchInput();
    renderLoadedAmount();
    setLoadingState(false);

    if (isInitialLoad) {
        showPokeballLoader(false);
    }
}

function renderPokemons(amount){
    let pokemonElement = document.getElementById("pokemons");
    pokemonElement.innerHTML = "";

    for(let i = 0; i < amount; i++){
        pokemonElement.innerHTML += pokemonCardTemplate(i + 1);
    }
}

function renderLoadedAmount(){
    let loadedAmountTag = document.getElementById("loadedAmountInfo");
    loadedAmountTag.innerHTML = "";

    loadedAmountTag.innerHTML = `${renderAmount} OF ${pokemonAmount} · NEXT BATCH 24`;    
}

function loadMorePokemon(){
    renderAmount += 24;
    setLoadingState(true);
    init();
}

function initSearchInput() {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const searchHint = document.getElementById("searchHint");

    searchInput.addEventListener("input", () => {
        const length = searchInput.value.length;
        const isValid = length >= 3;

        updateSearchHint(searchHint, length);

        if (isValid) {
            enableSearchButton(searchButton);
        } else {
            disableSearchButton(searchButton);
        }
    });
}

function enableSearchButton(button) {
    button.classList.add("searchButtonActive");
    button.onclick = getSearchResult;
}

function disableSearchButton(button) {
    button.classList.remove("searchButtonActive");
    button.onclick = null;
}

function updateSearchHint(hintElement, length) {
    if (length === 0) {
        hintElement.textContent = "";
        hintElement.textContent = "TYPE AT LEAST 3 CHARACTERS";
        hintElement.classList.remove("searchHint");
    } else if (length === 1) {
        hintElement.textContent = "";
        hintElement.textContent = "2 MORE CHARACTERS TO SEARCH";
        hintElement.classList.remove("searchHint");
    } else if (length === 2) {
        hintElement.textContent = "";
        hintElement.textContent = "1 MORE CHARACTER TO SEARCH";
        hintElement.classList.remove("searchHint");
    } else {
        hintElement.textContent = "";
        hintElement.textContent = "Press SEARCH or Enter";
        hintElement.classList.add("searchHint");
    }
}

function showFavorites(){
    const favButton = document.getElementById("favButton");

    favButton.classList.toggle("favButtonEnabled");
}

function toggleFavIcon(button) {
    const icon = button.querySelector(".cardFavIcon");
    icon.classList.toggle("cardFavIconActive");
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