# Pokédex

A Pokédex built with plain HTML, CSS and JavaScript. No frameworks, no build step, no
dependencies. The data comes from [PokéAPI](https://pokeapi.co) and is kept in localStorage, so a
reload does not fetch everything again.

## Running it

The app loads its fonts from disk and fetches over HTTPS, so it needs a web server rather than a
double-click on index.html. In VS Code, right click index.html and choose "Open with Live Server".
Without VS Code, run `python3 -m http.server 8000` in the project root and open
http://localhost:8000.

## What it does

The grid loads 24 Pokémon at a time. LOAD MORE fetches the next batch and locks itself while the
request is running; the counters in the header and below the grid follow along. Each card is
coloured after the Pokémon's primary type, including the frame around the artwork.

Clicking a card opens a dialog with three sections: general info, base stats and the evolution
chain. On narrow screens the sections are tabs, from 820px upwards all three are visible at once.
The species and evolution-chain requests only happen when a dialog is opened for the first time,
and the result is stored on the Pokémon, so opening the same card again costs nothing. Arrow keys
and the two buttons at the bottom walk through the list and load further batches if needed;
clicking an evolution stage jumps straight to that Pokémon.

The search field filters the loaded cards by name from the third character onwards, and there is a
SEARCH button for the same thing. If nothing matches, a box explains why and offers to clear the
search. Favourites are toggled on the cards, counted in the header and can be shown on their own.
The theme switch and the favourites both survive a reload.

If the API cannot be reached, an error box with a RETRY button takes the place of the grid. When
some Pokémon are already cached, those stay on screen and the box is appended below them, where it
can also be dismissed.

## How it is put together

Everything runs in the global scope, so the script order in index.html matters: pokeapi.js and
templates.js have to come before script.js.

init() runs on body onload and handles both the first load and every LOAD MORE. On the first call
it sets renderAmount to BATCH_SIZE (24), restores what is in localStorage and shows the Pokéball
loader. Then it fetches whatever is missing, renders the cards, reads the total Pokémon count from
the API and writes everything back to storage. loadMorePokemon() only raises renderAmount by
another batch and calls init() again.

Pokémon are stored in pokemonCache under their ID with identity data, base stats, the species URL
and an evolution_chain that starts out empty. The stat bars in the dialog are drawn as 20 segments
against MAX_STAT_REFERENCE (200) in dialog.js. The storage key is pokemonData.

```
index.html
assets/
  fonts/               Archivo and Archivo Black
  icons/
src/
  css/
    standart.css       reset and body layout
    fonts.css          @font-face definitions
    header.css         header, search, theme and favourites buttons
    main.css           main area, load more, footer
    pokemonCard.css    card grid, cards, not-found and error boxes
    pokemonColors.css  type colours and card theming
    themeColors.css    light and dark theme variables
    dialog.css         detail dialog
    animations/        
        loadingButton.css   loading Button animation
        pokeballLoader.css  pokeball Loader animation
  js/
    pokeapi.js         API calls, cache, data model
    templates.js       all HTML templates
    script.js          app logic, rendering, search, favourites
    darkMode.js        theme switch
    consoleTests.js    test helpers, see below
    localStorage.js    persistence
    dialog.js          dialog behaviour and navigation
```

## Test helpers

Some states are awkward to trigger by hand, so consoleTests.js provides three functions for the
browser console. testPokeballLoader() shows the loader for four seconds and hides it again.
testInitialLoadError() replaces the grid with the error box as it appears when the very first load
fails, with a RETRY button and nothing else. testLoadMoreError() appends the dismissible version
below the cards, as if a LOAD MORE request had gone wrong.

A few functions from the app itself are useful in the console as well: clearLocalStorage() drops
the cached Pokémon, favourites and theme, showPokeballLoader(true) and setLoadingState(true)
toggle the two loading states, and goToPokemon(25) opens a Pokémon directly, loading the batches
in between. After changing anything about how data is fetched, clear the storage first, otherwise
the old entries hide whether the new requests actually run.

## Testing by hand

1. Open the network tab and reload. Only pokemon/1 to pokemon/24 and one pokemon request should
   show up, nothing about species or evolution chains.
2. Click a card. The two chain requests appear now. Open the same card again and no new request
   should follow.
3. Tab to a card and press Enter. The dialog opens.
4. Type three characters and click SEARCH. Then type nonsense: the not-found box appears and
   CLEAR SEARCH resets it.
5. Click LOAD MORE. The counter in the header goes from 24 to 48.
6. Resize to 320px. No horizontal scrollbar.
7. In the elements tab, check that only li elements sit directly inside ul#pokemons.

## Accessibility

The cards are list items inside a list and are exposed as buttons with role, tabindex and a
label naming the Pokémon, so they work with Tab and Enter. Icon buttons have labels, decorative
images have an empty alt. The dialog is the native dialog element, which handles focus and Esc on
its own. Every type colour is paired with a font colour that has enough contrast against it.

## Data

All Pokémon data and artwork comes from PokéAPI. Pokémon and the Pokémon names are trademarks of
Nintendo.

Retraining project 2026.