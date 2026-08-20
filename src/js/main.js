//! Language button

const lang = document.getElementById("lang");
const langButton = document.getElementById("langButton");

// <div> do what button do
lang.addEventListener("click", function(event) {
    if (event.target === this) {
        document.getElementById("langButton").click();
    }
});

// button action
langButton.addEventListener("click", function() {
    window.location.href = "../html/arabic.html";
});
