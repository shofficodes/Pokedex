let renderAmount = null;

async function init() {
    if (!renderAmount){
        renderAmount = 24;
    }

    await getDataFromApi(renderAmount);

    console.log(pokemonCache);

    renderPokemons(renderAmount);
}

function renderPokemons(amount){
    let pokemonElement = document.getElementById("pokemons");
    pokemonElement.innerHTML = "";

    for(let i = 0; i < amount; i++){
        pokemonElement.innerHTML += pokemonCardTemplate(i + 1);
    }
}