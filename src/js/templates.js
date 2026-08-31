function pokemonCardTemplate(pokeIndex) {
    return `
        <div class="pokemonCardWrapper">
                <section class="pokemonCard" data-id="card" data-type="${pokemonCache[pokeIndex].types[0]}">
                    <header class="pokemonCardHeader">
                        <p>${formatPokemonId(pokemonCache[pokeIndex].id)}</p>
                        <button class="cardFavButton" data-id="favButton" aria-label="Add to favorite" onclick="toggleFavIcon(this)">
                            <div class="cardFavIcon" aria-hidden="true"></div>
                        </button>
                    </header>

                    <div class="cardContent">
                        <h2>${toUpperCaseString(pokemonCache[pokeIndex].name)}</h2>
                        <div class="typeWrapper">
                            ${getTypeHTML(pokeIndex)}
                        </div>
                        <div class="cardImgWrapper">
                            <img data-id="cardImage" src="${pokemonCache[pokeIndex].image}" alt="${pokemonCache[pokeIndex].name}_Image">
                        </div>
                    </div>
                    <p>#${pokemonCache[pokeIndex].id}</p>
                </section>
            <div class="pokemonCardShadow"></div>
        </div>
            `
}

function getTypeHTML(pokeIndex) {
    let typesHtml = ""

    for (let i = 0; i < pokemonCache[pokeIndex].types.length; i++) {
        typesHtml += `<span data-type="${pokemonCache[pokeIndex].types[i]}">${toUpperCaseString(pokemonCache[pokeIndex].types[i])}</span>\n`;
    }

    if (typesHtml === "") {
        return "<span></span>"
    }

    return typesHtml
}

function toUpperCaseString(input) {
    return input.toUpperCase();
}

function formatPokemonId(id) {
    return "#" + String(id).padStart(3, "0");
}