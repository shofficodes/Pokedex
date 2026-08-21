const minRenderedItems = 24;

const breakpoints = [
    { minWidth: 0,    columns: 1, renderedItems: calculateItemsToRender(minRenderedItems, 1) },
    { minWidth: 375,  columns: 2, renderedItems: calculateItemsToRender(minRenderedItems, 2) },
    { minWidth: 768,  columns: 3, renderedItems: calculateItemsToRender(minRenderedItems, 3) },
    { minWidth: 1024, columns: 4, renderedItems: calculateItemsToRender(minRenderedItems, 4) },
    { minWidth: 1440, columns: 6, renderedItems: calculateItemsToRender(minRenderedItems, 6) }
];

function getItemsCountToRender() {
    const width = window.innerWidth;
    
    for (let i = breakpoints.length - 1; i >= 0; i--) {
        if (width >= breakpoints[i].minWidth) {
            return breakpoints[i].renderedItems;
        }
    }
    
    return breakpoints[0].renderedItems;
}

function calculateItemsToRender(minItems, columns) {
    const rows = Math.ceil(minItems / columns);
    return rows * columns;
}

