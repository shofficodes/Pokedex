function getCardHeaderHtml(pokeIndex, favIconClass) {
  return `
    <header class="pokemonCardHeader">
      <p>${formatPokemonId(pokemonCache[pokeIndex].id)}</p>
      <button class="cardFavButton" data-id="favButton" aria-label="Add to favorite" onclick="event.stopPropagation(); toggleFavIcon(this); toggleFavorites(${pokeIndex})">
        <div class="${favIconClass}" aria-hidden="true"></div>
      </button>
    </header>
  `;
}

function getCardContentHtml(pokeIndex) {
  return `
    <div class="cardContent">
      <h2>${toUpperCaseString(pokemonCache[pokeIndex].name)}</h2>
      <div class="typeWrapper">${getTypeHTML(pokeIndex)}</div>
      <div class="cardImgWrapper">
        <img data-id="cardImage" src="${pokemonCache[pokeIndex].image}" alt="${pokemonCache[pokeIndex].name}_Image">
      </div>
    </div>
  `;
}

function pokemonCardTemplate(pokeIndex) {
  const isFavorite = favorites.includes(pokeIndex);
  const favIconClass = isFavorite ? "cardFavIcon cardFavIconActive" : "cardFavIcon";
  return `
    <div class="pokemonCardWrapper">
      <section class="pokemonCard" data-id="card" data-type="${pokemonCache[pokeIndex].types[0]}" onclick="openPokemonDialog(${pokeIndex})">
        ${getCardHeaderHtml(pokeIndex, favIconClass)}
        ${getCardContentHtml(pokeIndex)}
        <p>#${pokemonCache[pokeIndex].id}</p>
      </section>
      <div class="pokemonCardShadow"></div>
    </div>
  `;
}

function getTypeHTML(pokeIndex) {
  let typesHtml = "";

  for (let i = 0; i < pokemonCache[pokeIndex].types.length; i++) {
    typesHtml += `<span data-type="${pokemonCache[pokeIndex].types[i]}">${toUpperCaseString(pokemonCache[pokeIndex].types[i])}</span>\n`;
  }

  if (typesHtml === "") {
    return "<span></span>";
  }

  return typesHtml;
}

function toUpperCaseString(input) {
  return input.toUpperCase();
}

function formatPokemonId(id) {
  return "#" + String(id).padStart(3, "0");
}

function getDialogImagePanelHtml(pokemon, primaryType, secondaryType) {
  return `
    <div class="dialogImagePanel" data-type="${primaryType}">
      <div class="dialogSplit dialogSplitA" data-type="${primaryType}"></div>
      <div class="dialogSplit dialogSplitB" data-type="${secondaryType}"></div>
      <p class="dialogId">${formatPokemonId(pokemon.id)}</p>
      <img data-id="dialog-image" class="dialogImage" src="${pokemon.image}" alt="${pokemon.name}_Image">
    </div>
  `;
}

function getDialogHeaderHtml(pokemon) {
  return `
    <button data-id="close-dialog-button" class="dialogCloseButton" aria-label="Close dialog" onclick="closeDialog()">✕</button>
    <h2>${toUpperCaseString(pokemon.name)}</h2>
    <div class="typeWrapper">${getTypeHTML(pokemon.id)}</div>
  `;
}

function getDialogTabsHtml() {
  return `
    <div class="dialogTabs">
      <button type="button" class="dialogTab dialogTabActive" data-tab="about" onclick="switchDialogTab('about', this)">ABOUT</button>
      <button type="button" class="dialogTab" data-tab="stats" onclick="switchDialogTab('stats', this)">BASE STATS</button>
      <button type="button" class="dialogTab" data-tab="evolution" onclick="switchDialogTab('evolution', this)">EVOLUTION</button>
    </div>
  `;
}

function getDialogAboutSectionHtml(pokemon) {
  return `
    <div class="dialogSection dialogSectionActive" data-tab="about">
      <dl class="dialogAboutList">
        <dt>SPECIES</dt><dd>${toUpperCaseString(pokemon.species)}</dd>
        <dt>HEIGHT</dt><dd>${(pokemon.height / 10).toFixed(1)} M</dd>
        <dt>WEIGHT</dt><dd>${(pokemon.weight / 10).toFixed(1)} KG</dd>
        <dt>ABILITIES</dt><dd>${pokemon.abilities.map(toUpperCaseString).join(", ")}</dd>
        <dt>TYPES</dt><dd>${pokemon.types.join(" / ")}</dd>
      </dl>
    </div>
  `;
}

function getDialogStatsSectionHtml(pokemon) {
  return `
    <div class="dialogSection" data-tab="stats">
      <h3>BASE STATS</h3>
      ${getStatBarHTML("HP", pokemon.hp)}
      ${getStatBarHTML("ATTACK", pokemon.attack)}
      ${getStatBarHTML("DEFENSE", pokemon.defense)}
      ${getStatBarHTML("SP. ATK", pokemon.sp_attack)}
      ${getStatBarHTML("SP. DEF", pokemon.sp_defense)}
      ${getStatBarHTML("SPEED", pokemon.speed)}
    </div>
  `;
}

function getDialogEvolutionSectionHtml(pokemon) {
  return `
    <div class="dialogSection" data-tab="evolution">
      <h3>EVOLUTION</h3>
      <div class="dialogEvolutionWrapper">
        ${getEvolutionHTML(pokemon)}
      </div>
    </div>
  `;
}

function getDialogSectionsHtml(pokemon) {
  return `
    ${getDialogTabsHtml()}
    ${getDialogAboutSectionHtml(pokemon)}
    ${getDialogStatsSectionHtml(pokemon)}
    ${getDialogEvolutionSectionHtml(pokemon)}
  `;
}

function getDialogNavHtml(pokemon) {
  return `
    <div class="dialogNav">
      <button data-id="prev-button" aria-label="Previous Pokémon" onclick="showPreviousPokemon()">←</button>
      <p>${pokemon.id} / ${renderAmount}</p>
      <button data-id="next-button" aria-label="Next Pokémon" onclick="showNextPokemon()">→</button>
    </div>
  `;
}

function pokemonDialogTemplate(pokemon) {
  const primaryType = pokemon.types[0];
  const secondaryType = pokemon.types[1] || primaryType;
  return `
    <div data-id="overlay-pokemon-name" class="dialogContent">
      ${getDialogImagePanelHtml(pokemon, primaryType, secondaryType)}
      <div class="dialogInfoPanel">
        ${getDialogHeaderHtml(pokemon)}
        ${getDialogSectionsHtml(pokemon)}
        ${getDialogNavHtml(pokemon)}
      </div>
    </div>
  `;
}

function getNotFoundHtml(query) {
  return `
    <div class="notFoundBox" data-id="not-found">
      <p class="notFoundLabel">0 RESULTS</p>
      <h2 class="notFoundHeading">NO MATCH FOUND.</h2>
      <p class="notFoundText">Nothing in the loaded batch matches your search. Try a shorter term — the search runs on names only.</p>
      <button type="button" class="notFoundClearButton" onclick="clearSearch()">CLEAR SEARCH</button>
    </div>
  `;
}

function getApiErrorHtml(dismissible = false) {
  const closeButton = dismissible
    ? `<button type="button" class="apiErrorCloseButton" aria-label="Dismiss error" onclick="dismissApiError(this)">✕</button>`
    : "";

  return `
    <div class="apiErrorBox" data-id="api-error">
      ${closeButton}
      <p class="apiErrorLabel">ERROR 503</p>
      <h2 class="apiErrorHeading">COULD NOT REACH THE API.</h2>
      <p class="apiErrorText">The request to pokeapi.co failed. Cached entries stay available — press retry to fetch the missing ones.</p>
      <button type="button" class="apiErrorRetryButton" onclick="retryFailedLoad()">RETRY</button>
    </div>
  `;
}

function getStatBarHTML(label, value) {
  const totalSegments = 20;
  const filledSegments = getFilledSegmentCount(value, totalSegments, MAX_STAT_REFERENCE);
  const segmentsHtml = getStatSegmentsHtml(filledSegments, totalSegments);

  return `
    <div class="statRow">
      <span class="statLabel">${label}</span>
      <span class="statValue">${value}</span>
      <div class="statBarTrack">${segmentsHtml}</div>
    </div>
  `;
}

function getEvolutionStageHTML(stage, pokemon) {
  const isCurrent = stage.id === pokemon.id;
  const stageClass = isCurrent ? "evolutionStage evolutionStageCurrent" : "evolutionStage";
  const stageImage = pokemonCache[stage.id] ? pokemonCache[stage.id].image : "";
  const clickHandler = isCurrent ? "" : `onclick="goToPokemon(${stage.id})"`;
  const currentAttr = isCurrent ? `aria-current="true"` : "";

  return `
    <button type="button" class="${stageClass}" ${clickHandler} aria-label="Show ${stage.name}" ${currentAttr}>
      <img src="${stageImage}" alt="${stage.name}">
      <p>${toUpperCaseString(stage.name)}</p>
      <p>${formatPokemonId(stage.id)}</p>
    </button>
  `;
}