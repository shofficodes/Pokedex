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

    searchInput.addEventListener("input", () => {
        const isValid = searchInput.value.length >= 3;

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