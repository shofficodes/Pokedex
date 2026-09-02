function testPokeballLoader() {
    showPokeballLoader(true);

    setTimeout(() => {
        showPokeballLoader(false);
    }, 4000);
}