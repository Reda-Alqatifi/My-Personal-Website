import {popup_close} from "./pop_up.js";
import {cardsToAnchor , changeLanguage} from "./div_as_anchor.js";
import {carousel} from "./cards_scrolling.js";
import {myWorks} from "./my_works.js";
import {sectionsAnimation} from "./Animation.js";
import { initLanguage } from "./i18n/i18n.js";


// ////////////////////////////////////////

// ! for div to act as an <a></a>
initLanguage();
changeLanguage();

cardsToAnchor();

// ! to close the pop-up after pressing "Close"
popup_close();

// ! for cards infinte scrolling
carousel(); 

// ! for chosing the type of works (software , novels , arts)
myWorks();

// ! Animation 
sectionsAnimation();
