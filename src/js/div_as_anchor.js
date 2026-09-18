import {popup_open , popup_data , waitingForAgreement} from "./pop_up.js";
import { applyLanguage, currentLanguage , translate} from "./i18n/i18n.js";

function changeLanguage() {
    //! Language button

    const lang = document.getElementById("lang");
    const langButton = document.getElementById("langButton");

    // <div> do what button do
    lang.addEventListener("click", function (event) {
        if (event.target === this)
            langButton.click();
    });

    // button action
    langButton.addEventListener("click", () => {
        if (currentLanguage() === "ar")
            applyLanguage("en");
        else
            applyLanguage("ar");
    });
}

function cardsToAnchor() {
    document.addEventListener("click", async function (event) {
        const card = event.target.closest(".card");
        const spoiler = event.target.closest(".spoiler");

        if (!card) 
            return;

        let destination = {des : card.dataset.destination}; // I made it as an object to pass it by ref
        const target = card.dataset.target;
        
        if (spoiler) {
            let media = spoiler.dataset.media;
            let media_type = spoiler.dataset.type;

            
            const data = popup_data("spoiler" , media , translate(media_type));

            popup_open(data);

            await waitingForAgreement(destination.des);

            popup.classList.remove("open");
        }

        if (destination.des.trim() === "")
            return;

        if (target === "_blank") {
            window.open(destination.des, "_blank");
        } else {
            window.location.href = destination.des;
        }
    });

    document.addEventListener("click" , event => {
        const isNotYet = event.target.closest(".not-yet");

        if (!isNotYet)
            return;

        const data = popup_data("not-yet");

        popup_open(data);
    });
}

// //////////////////////////

export {cardsToAnchor , changeLanguage};
