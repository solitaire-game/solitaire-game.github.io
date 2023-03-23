import "./optionField.js";
import { importCss } from "../functions.js";

customElements.define("options-menu", class OptionsMenu extends HTMLElement {
    constructor(){
        super();
    }

    connectedCallback(){
        //import css
        importCss('./option-menu/optionsmenu.css');
        
    }
});

console.log("optionmenu loaded");