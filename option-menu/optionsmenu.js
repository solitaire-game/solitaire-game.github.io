import "./optionField.js";

customElements.define("options-menu", class OptionsMenu extends HTMLElement {
    constructor(){
        super();
    }

    connectedCallback(){
        Array.from(this.attributes).map(attr => {
            if(attr == 'board'){
                //hookup to board
            }
            else{
                //read name and value make options of this
                
            }
        });
    }
});

console.log("optionmenu loaded");