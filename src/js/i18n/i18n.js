import { dictionary } from "./dictionary.js";

const DEFAULT = "en";
let current = DEFAULT;
let langAnimTimer = null;

// translate one key, with optional {placeholders}
function translate(key, vars = {}) {
    // let s = dictionary[current]?.[key] ?? dictionary[DEFAULT]?.[key] ?? key;

    let s;
    if (dictionary[current] && dictionary[current][key] !== undefined && dictionary[current][key] !== null)
        s = dictionary[current][key];
    else if (dictionary[DEFAULT] && dictionary[DEFAULT][key] !== undefined && dictionary[DEFAULT][key] !== null)
        s = dictionary[DEFAULT][key];
    else
        s = key;

    for (const [k, v] of Object.entries(vars)){
        s = s.replaceAll(`{${k}}`, v);
    }

    return s;
}

function applyLanguage(lang , animate = true) {
    current = dictionary[lang] ? lang : DEFAULT;

    // 1. direction + language on the root element
    const html = document.documentElement;
    html.lang = current;
    html.dir  = (current === "ar") ? "rtl" : "ltr";

    // 2. text nodes
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key   = el.dataset.i18n;
        const attrs = el.dataset.i18nAttr;      // e.g. "aria-label" or "alt,title"

        if (attrs) {
            attrs.split(",").forEach(a => el.setAttribute(a.trim(), translate(key)));
        } else {
            el.textContent = translate(key);
        }

        // 3. keep the CSS ghost layer (content: attr(data-text)) in sync
        const ghost = el.hasAttribute("data-text")? el : el.parentElement?.closest("[data-text]");
        if (ghost)
            ghost.setAttribute("data-text", translate(key));
    });

    // 4. page title + the toggle button label
    const btn = document.getElementById("langButton");
    if (btn) btn.textContent = (current === "ar") ? "EN" : "Ar";

    // 5. remember the choice
    try { localStorage.setItem("lang", current); } catch {}

    // 6. the switch animation (left>>>right for arabic , right>>>left for english)
    if (animate) {
        const root = document.documentElement;

        root.classList.remove("lang-switch-ar" , "lang-switch-en");
        void root.offsetWidth;   // force a reflow so the animation restarts
        root.classList.add("lang-switch-" + current);

        clearTimeout(langAnimTimer);
        langAnimTimer = setTimeout(() => {
            root.classList.remove("lang-switch-ar" , "lang-switch-en");
        } , 700);
    }

    // 7. let other modules react (carousel re-measure, etc.)
    window.dispatchEvent(new CustomEvent("languagechange", { detail: current }));
}

// first paint: URL ?lang=ar  >  saved choice  >  browser language  >  en
function initLanguage() {
    const fromUrl   = new URLSearchParams(location.search).get("lang");
    const fromStore = (() => { try { return localStorage.getItem("lang"); } catch { return null; } })();
    const fromNav   = navigator.language?.startsWith("ar") ? "ar" : null;
    applyLanguage(fromUrl || fromStore || fromNav || DEFAULT , false);
}

function currentLanguage() { return current; }

export { translate, applyLanguage, initLanguage, currentLanguage };
