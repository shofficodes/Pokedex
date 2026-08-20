async function init() {
    await getDataFromApi(30);

    console.log(pokemonCache);
}