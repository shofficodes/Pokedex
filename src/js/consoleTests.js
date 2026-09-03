const POKEBALL_TEST_DURATION_MS = 4000;

function testPokeballLoader() {
  showPokeballLoader(true);

  setTimeout(() => {
    showPokeballLoader(false);
  }, POKEBALL_TEST_DURATION_MS);
}

function testInitialLoadError() {
  document.getElementById("pokemons").innerHTML = getApiErrorHtml();
  setLoadMoreVisible(false);
}

function testLoadMoreError() {
  if (document.querySelector(".apiErrorBox")) {
    return;
  }

  renderAmount += BATCH_SIZE;
  appendApiErrorBox();
  setLoadMoreVisible(false);
}