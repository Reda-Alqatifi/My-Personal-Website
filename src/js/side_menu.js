// ! Side menu (small screens)

function sideMenu() {
    const menuButton = document.getElementById("menuButton");
    const menu       = document.getElementById("sideMenu");
    const icon       = menuButton.querySelector(".material-symbols-outlined");

    function openMenu() {
        menu.classList.add("open");
        menuButton.setAttribute("aria-expanded", "true");
        icon.textContent = "close"; // ☰ >>> ✕
    }

    function closeMenu() {
        menu.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        icon.textContent = "menu";  // ✕ >>> ☰
    }

    // ☰ button : open / close
    menuButton.addEventListener("click", () => {
        if (menu.classList.contains("open"))
            closeMenu();
        else
            openMenu();
    });

    // close after choosing a link
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // close when clicking outside the menu
    document.addEventListener("click", e => {
        if (!menu.contains(e.target) && !menuButton.contains(e.target))
            closeMenu();
    });

    // close with the "Escape" key
    document.addEventListener("keydown", e => {
        if (e.key === "Escape")
            closeMenu();
    });
}


// //////////////////

export {sideMenu};
