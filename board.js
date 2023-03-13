import { importCss } from "./functions.js";
import '../cardpile.js';

class Board extends HTMLElement {
    constructor() {
        super();
        this.moves = [];
        this.init = 1;
    }

    connectedCallback() {
        if (this.init == 1) {
            //import css 
            importCss('./board.css');

            //add eventlistners
            this.addEventListener("click", (evt) => this.clickHandler(evt));
            
            //if we have drag get the drag listners.
            if (this.hasAttribute("drag")) {
                if (this.getAttribute("drag") == "true") {

                    //making the card pile for dragin
                    const dragdiv = /*html*/`<card-pile id="dragdiv" view="col"></card-pile>`;
                    this.insertAdjacentHTML("beforeend", dragdiv);

                    //adding eventlistners no touch atm
                    this.addEventListener("dragstart", (evt) => this.dragStartHandler(evt));
                    document.addEventListener("dragover", (evt) => this.onMouseMove(evt));
                    this.addEventListener("dragend", (evt) => this.dragEndHandler(evt));
                    // this.addEventListener("touchstart", (evt) => this.dragstartHandler(evt));
                    // document.addEventListener("touchmove", (evt) => this.onMouseMove(evt));
                    // this.addEventListener("touchend", (evt) => this.touchEndHandler(evt));
                }
            }
            this.init = 0;
        }
    }

    get selectedCards() {
        return Array.from(document.querySelectorAll("[selected]"));
    }

    clickHandler(e) {
        typeof e.target.cardClick == "function"? e.target.cardClick(e) : this.clearSelected();
    }
    dragStartHandler(e) {
        const dt = e.dataTransfer
        const card = e.target;
        this.oldParent = card.parentElement;
        //check if the draged element is a card thats dragable
        if (card.draggable && card.nodeName == "PLAY-CARD") {
            
            //unselect so we can select and drag
            if(card.selected)card.toggleSelected(false);

            //use cardclick for the selection part
            card.parentElement.cardClick(e);
            const drags = this.selectedCards;

            //set the cards to follow mouse
            const mdiv = document.getElementById("dragdiv");
            //calc the position of the mouse on the card
            const i = e.clientX ? e : e.changedTouches[0];
            const xline = i.clientX - e.target.getBoundingClientRect().x;
            const yline = i.clientY - e.target.getBoundingClientRect().y;
            mdiv.style.setProperty("--xline", `${xline}px`);
            mdiv.style.setProperty("--yline", `${yline}px`);
            this.onMouseMove(e);

            if (e.type != "touchstart") {
                //need a setTimeout otherwise the dragevent fails
                setTimeout(function () {
                    mdiv.append(...drags);
                });

                //make a no ghost
                const img = document.createElement("img");
                dt.setDragImage(img, 0, 0);
            }else {
                // no delay for the touch event
                mdiv.append(...drags);
            }
        } else {
            // when no dragable card element found
            return;
        }
    }
    onMouseMove(e) {
        const mdiv = document.getElementById("dragdiv");
        if (e.clientX) {
            mdiv.style.left = `calc(${e.clientX}px - var(--xline))`;
            mdiv.style.top = `calc(${e.clientY}px - var(--yline))`;
        } else {
            mdiv.style.left = `calc(${e.changedTouches[0].clientX}px - var(--xline))`;
            mdiv.style.top = `calc(${e.changedTouches[0].clientY}px - var(--yline))`;
        }
        return false;
    }
    dragEndHandler(e) {
        this.clearSelected();
    }
    touchEndHandler(e) {
        let endElement = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        if (endElement.nodeName == "PLAY-CARD") endElement = endElement.parentElement;
        if (endElement.nodeName == "CARD-PILE") {
            console.log("touchend");
            endElement.cardClick(e);
        } else {
            this.clearSelected();
        }
    }

    showRules(){
        const rules = `De kaartreeksen op de speelstapels dienen daar aflopend worden geplaatst. De kaartkleuren dienen om-en-om (rood en zwart) gebruikt worden. U kunt hele reeksen of delen daarvan verplaatsen als de eerste kaart op een andere stapel past.

        Op een vrije stapel kunt u een Heer van elke kleur plaatsen of een kaartenreeks die begint met een Heer.`;
        window.alert(rules);
    }

    undoMove(){
        const undoMsgField = document.getElementById("undoinfo");
        undoMsgField.innerText = "";
        if(this.moves.length > 0){
            const lastmove = this.moves.pop();
            const[to,from,cards,flip] = lastmove;

            //undomove
            switch(flip){
                case 2:
                    // undo drawcard
                    to.prepend(...cards)
                break;
                case 3:
                    //undo drawcard reset
                    to.append(...cards);
                break;
                default:
                    if(flip)to.lastElementChild.flip();
                    to.append(...cards);
                break;
            }
            
        }else{
            undoMsgField.innerText = "no undomoves";
        }
    }
    
    record(from,to,cards,flip){
        this.moves.push([from,to,cards,flip]);
    }
    
    checkWin(){
        const backCards = this.getElementsByClassName("flipped") ;
        const check = backCards.length == 0? true : false;
        if(check){
            // this.completeWin();
            console.log("player wins");
            window.alert("u heeft gewonen");
        }
        return check;
    }
    
    //! old board function need checkup
    completeWin(){
        const heartsPile = document.querySelector("card-pile[suit=hearts]");
        const spadesPile = document.querySelector("card-pile[suit=spades]");
        const clubsPile = document.querySelector("card-pile[suit=clubs]");
        const diamondsPile = document.querySelector("card-pile[suit=diamonds]");
        const cards = Array.from(document.getElementsByTagName("play-card"));
        cards.sort((a,b) =>{ 
            return a.index - b.index;
        });
        for(const card of cards){
            if(card.parentElement.getAttribute("click") == "select" || "select_place"){
                switch(card.suit){
                    case "hearts":
                        card.toggleSelected(true);
                        heartsPile.cardClick();
                    break;
                    case "spades":
                        card.toggleSelected(true);
                        spadesPile.cardClick();
                    break;
                    case "clubs":
                        card.toggleSelected(true);
                        clubsPile.cardClick();
                    break;
                    case "diamonds":
                        card.toggleSelected(true);
                        diamondsPile.cardClick();
                    break;
                }
            }
        }
    }

    //! end old
    clearSelected() {
        const dragdiv = document.getElementById("dragdiv");
        if(dragdiv){
            if (dragdiv.childElementCount > 0) {
                // put cards back to oldparent
                this.oldParent.placecard();
                this.oldParent = false;
            }
        }
        for (const card of this.selectedCards) {
            card.toggleSelected(false);
        }
    }


} 
customElements.define("rt-board", Board);
export { Board };
console.log("board.js loaded");