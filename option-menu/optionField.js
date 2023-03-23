
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
            this.constructRadioButton(attr);
        });
    }

    constructRadioButton(attr){
        attr.value.split(",").map(value =>{
            const input = document.createElement("input")
            input.id = attr.name+value;
            input.type = "radio";
            input.name = attr.name;
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