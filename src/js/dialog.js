let currentDialogIndex = null;
let isNavigating = false;
let closeListenerAttached = false;

async function openPokemonDialog(pokeIndex) {
    await navigateToPokemon(pokeIndex);

    const dialog = document.getElementById("pokemonDialog");
    attachDialogCloseHandler(dialog);
    dialog.showModal();
    document.body.classList.add("dialogOpen");

    dialog.addEventListener("click", handleBackdropClick);
    document.addEventListener("keydown", handleDialogKeydown);
}

function attachDialogCloseHandler(dialog) {
    if (closeListenerAttached) {
        return;
    }
    dialog.addEventListener("close", handleDialogClose);
    closeListenerAttached = true;
}

function handleDialogClose() {
    document.body.classList.remove("dialogOpen");
    const dialog = document.getElementById("pokemonDialog");
    dialog.removeEventListener("click", handleBackdropClick);
    document.removeEventListener("keydown", handleDialogKeydown);
}

async function navigateToPokemon(pokeIndex) {
    if (!pokemonCache[pokeIndex]) {
        await getPokemon(pokeIndex);
    }

    currentDialogIndex = pokeIndex;
    await renderDialog(pokeIndex);
}

function closeDialog() {
    document.getElementById("pokemonDialog").close();
}

function handleBackdropClick(event) {
    const dialog = document.getElementById("pokemonDialog");
    const rect = dialog.getBoundingClientRect();

    const clickedOutside =
        event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom;

    if (clickedOutside) {
        closeDialog();
    }
}

function handleDialogKeydown(event) {
    if (event.key === "ArrowLeft") {
        showPreviousPokemon();
    } else if (event.key === "ArrowRight") {
        showNextPokemon();
    }
}

async function ensureLoadedUpTo(pokeIndex) {
    while (pokeIndex > renderAmount) {
        await loadMorePokemon();
    }
}

async function goToPokemon(pokeIndex) {
    if (isNavigating || pokeIndex < 1 || pokeIndex > pokemonAmount) {
        return;
    }

    isNavigating = true;
    try {
        await ensureLoadedUpTo(pokeIndex);
        await navigateToPokemon(pokeIndex);
    } finally {
        isNavigating = false;
    }
}

function showPreviousPokemon() {
    goToPokemon(currentDialogIndex - 1);
}

function showNextPokemon() {
    goToPokemon(currentDialogIndex + 1);
}

async function renderDialog(pokeIndex) {
    const pokemon = pokemonCache[pokeIndex];
    const dialog = document.getElementById("pokemonDialog");

    dialog.innerHTML = pokemonDialogTemplate(pokemon);

    if (pokemon.evolution_chain.length === 0) {
        await getEvolutionData(pokemon.pokemon_species_url, pokemon.id);

        if (currentDialogIndex === pokeIndex) {
            dialog.innerHTML = pokemonDialogTemplate(pokemon);
        }
    }
}

function getFilledSegmentCount(value, totalSegments, maxReference) {
    return Math.min(totalSegments, Math.round((value / maxReference) * totalSegments));
}

function getStatSegmentsHtml(filledSegments, totalSegments) {
    let segmentsHtml = "";
    for (let i = 0; i < totalSegments; i++) {
        const filledClass = i < filledSegments ? "statSegment statSegmentFilled" : "statSegment";
        segmentsHtml += `<div class="${filledClass}"></div>`;
    }
    return segmentsHtml;
}

function getStatBarHTML(label, value) {
    const totalSegments = 20;
    const filledSegments = getFilledSegmentCount(value, totalSegments, 200);
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

function getEvolutionHTML(pokemon) {
    if (pokemon.evolution_chain.length === 0) {
        return `<p class="dialogEvolutionLoading">Loading evolution chain...</p>`;
    }

    let evolutionHtml = "";
    pokemon.evolution_chain.forEach(stage => {
        evolutionHtml += getEvolutionStageHTML(stage, pokemon);
    });

    return evolutionHtml;
}

function switchDialogTab(tabName, clickedButton) {
    const sections = document.querySelectorAll(".dialogSection");
    sections.forEach(section => {
        section.classList.toggle("dialogSectionActive", section.dataset.tab === tabName);
    });

    const tabs = document.querySelectorAll(".dialogTab");
    tabs.forEach(tab => {
        tab.classList.toggle("dialogTabActive", tab === clickedButton);
    });
}