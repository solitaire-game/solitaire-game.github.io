import "./optionField.js";
import { importCss } from "../functions.js";

customElements.define("options-menu", class OptionsMenu extends HTMLElement {
    constructor(){
        super();
    }

    connectedCallback(){
        console.warn("connected",this.nodeName);
        //import css
        importCss('./option-menu/optionsmenu.css');
        this.makeButton();
        this.onclick = (e => {this.toggleDisplay(e.target)})
        setTimeout(() => {
            console.warn("parsed",this.nodeName)            
        });
    }

    get getoptions(){
        const arr = [];
        Array.from(this.childNodes).map(node =>{
            if(node.nodeName != "#text"){
                if(node.nodeName != "BUTTON"){
                    if(!node.nodeName.toLowerCase().split('-').includes('button')){
                        console.log(node);
                        arr.push(node.option);
                    }
                }
            }
        });
        return arr; 
    }

    get board(){
        return this.getAttribute('board');
    }

    setOptions(options = this.getoptions){
        localStorage.setItem(this.board, JSON.stringify(options));
    }

    toggleDisplay(node){
        if(node == this)this.toggleAttribute(`visible`);
    }

    
    makeButton(){
        //buton with onlick change to option-button thingy
        // const button = /*html*/`<button onclick="document.querySelector('options-menu').klaas()">confirm</button>`;
        const button = document.createElement('option-button');
        console.log(button);
        this.append(button);
    }

    klaas(){
        //get the values and set it in the local storage
       this.setOptions();
       this.toggleAttribute('visible');
       location.reload()
    }
});


console.log("optionmenu loaded");