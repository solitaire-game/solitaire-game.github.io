
//base optionfield class for generic functions/getters
class OptionField extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
    }

    checkLocalValue(option){
        //get localstorage see wat value the given option is there;
    }

    closestElement(selector, el = this) {
        return (
            (el && el != document && el != window && el.closest(selector)) ||
            this.closestElement(selector, el.getRootNode().host)
        );
    }
    get menu() {
        return this.closestElement("options-menu");
    }

    get storageData(){
        //get local storage if first time not set yet get defoult from board
        return localStorage.getItem(this.boardID)? JSON.parse(localStorage.getItem(this.boardID)) : this.board.defaultOptions ;
    }

    get boardID(){
        return this.menu.getAttribute('board');
    }

    get board(){
        return document.querySelector(this.boardID);
    }

    inStorage(value){
        return this.storageData.includes(value);
    }

}

/*
structure
    <option-radio draw="1,3">
        <input type='radio' id="draw1" name="draw" value="1" checked><label for="draw1">1</label>
        <input type='radio' id="draw3" name="draw" value="3" checked><label for="draw3">1</label>
    </option-radio>

*/

customElements.define("option-radio", class OptionsRadio extends OptionField {
    constructor(){
        super();
    }

    connectedCallback(){
        super.connectedCallback();
        Array.from(this.attributes).map(attr => {
            const legend = document.createElement('legend');
            legend.textContent = attr.name;
            this.append(legend);
            this.constructRadioButton(attr);
        });

    }

    get name(){
        return this.querySelector(`legend`).innerText;
    }
    get value(){
        return this.querySelector('input:checked').value;
    }

    get option(){
        return this.name +'=' + this.value;
    }

    constructRadioButton(attr){
        attr.value.split(",").map(value =>{
            const input = document.createElement("input")
            input.id = attr.name+value;
            input.type = "radio";
            input.name = attr.name;
            input.checked = this.inStorage(attr.name+'='+value)? true : false;
            input.value = value;
            this.append(input);
            const label = document.createElement('label');
            label.htmlFor = attr.name+value;
            label.textContent = value;
            this.append(label);
        });
    }
});

console.log("optionfield loaded");

customElements.define("option-button", class OptionsButton extends OptionField {
    constructor(){
        super();
    }

    connectedCallback(){
        console.warn("connected",this.nodeName);
        super.connectedCallback();
        setTimeout(() => {
            this.constructButton();
            console.warn("parsed",this.nodeName)            
        });

    }

    constructButton(){
        const input = document.createElement('input');
        input.type = "button";
        console.log(this.menu)
        input.onclick = (e =>{this.menu.klaas()});
        input.value = 'submit';
        this.append(input);
    }

});

console.log("optionfield loaded");