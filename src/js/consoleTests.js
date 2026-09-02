function testPokeballLoader() {
    showPokeballLoader(true);

    setTimeout(() => {
        showPokeballLoader(false);
    }, 4000);
}

function testInitialLoadError() {
    document.getElementById("pokemons").innerHTML = getApiErrorHtml();
    setLoadMoreVisible(false);
}

function testLoadMoreError() {
    if (document.querySelector(".apiErrorBox")) {
        return;
    }

    renderAmount += 24;
    appendApiErrorBox();
    setLoadMoreVisible(false);
}