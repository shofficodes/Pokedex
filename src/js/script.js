let renderAmount = null;

async function init() {
    if (!renderAmount){
        renderAmount = 24;
    }

    await getDataFromApi(renderAmount);

    console.log(pokemonCache);

    renderPokemons(renderAmount);
    await getPokemonAmount();
    initSearchInput();
    renderLoadedAmount();
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