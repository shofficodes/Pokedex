function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const darkButton = document.querySelector(".darkButton");

    if (currentTheme === "dark") {
        document.documentElement.removeAttribute("data-theme");
        darkButton.textContent = "DARK";
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
        darkButton.textContent = "LIGHT";
    }
}