import { translate } from "./i18n/i18n.js";

const popup = document.getElementById("popup");
const inner_popup = document.getElementById("inner-popup");

// ! open pop-up window
function popup_open(data) {

    // ! very important to start the 1st innerHTML with '=' to not be dublicated.
    
    inner_popup.innerHTML = `<h1 class="Ptitle" data-text="${data.title}" >${data.title}</h1>`;
    inner_popup.innerHTML += `<h2 class="message" >${data.message}</h2>`;
    if (Object.hasOwn(data , "question"))
        inner_popup.innerHTML += `<p class="message" >${data.question}</p>`;
    inner_popup.innerHTML += `<button id="close" class="bt" >${data.button_1}</button>`;
    if (Object.hasOwn(data , "button_2"))
        inner_popup.innerHTML += `<button id="agreement" class="bt" >${data.button_2}</button>`;

    popup.classList.add("open");
}

// ! close pop-up window
function popup_close () {
    document.addEventListener("click" , event => {
        if (event.target.closest("#close")) {
            popup.classList.remove("open");
        }
    });
}

//! data into pop-up window

function waitingForAgreement(destination) {
    return new Promise(resolve => {
        document.addEventListener("click" , event => {
            const agreement = event.target.closest("#agreement");

            if (!agreement) {
                destination = " ";
                return;
            }

            document.removeEventListener("click" , this);

            resolve();
        });
    });
}

/* caller: "spoiler" or "not-yet" , (only for spolier => media: dataset.media , media_type: dataset.type)*/
function popup_data (caller , media , media_type) {
    if (caller === "spoiler" && media && media_type ) {
        return {
            // title : "Spoiler Warning!",
            // message : `This image contains spoiler from "${media}" ${media_type}.`,
            // question : "Are you sure you want to see it?",
            // button_1 : "No",
            // button_2 : "yes",

            // i18n_title : "popup.spoiler.title",
            // i18n_message : "popup.spoiler.message",
            // i18n_question : "popup.spoiler.question",
            // i18n_button_1 : "popup.spoiler.button_1",
            // i18n_button_2 : "popup.spoiler.button_2"

            title    : translate("popup.spoiler.title"),
            message  : translate("popup.spoiler.message", { media ,  media_type}),
            question : translate("popup.spoiler.question"),
            button_1 : translate("popup.spoiler.no"),
            button_2 : translate("popup.spoiler.yes")
        };
    }
    else if (caller === "not-yet") {
        return {
            // title : "Coming Soon",
            // message : "Working on this feature!",
            // button_1 : "Close",

            // i18n_title : "popup.title",
            // i18n_message : "popup.message",
            // i18n_button_1 : "popup..button_1"

            title    : translate("popup.soon.title"),
            message  : translate("popup.soon.message"),
            button_1 : translate("popup.soon.close")
        };
    }
}

// ///////////////////

export {popup_close , popup_open , waitingForAgreement , popup_data};
