import { importCss } from "./functions.js";
import '../cardpile.js';
import {RtSocket} from "https://rtdb.nl/rtsocket.js";

class Board extends HTMLElement {
    constructor() {
        super();
        this.moves = [];
        this.init = 1;
        this.toggleAttribute(`hidden`,true);
        // document.ws = new RtSocket();
        document.addEventListener("rtsocket-connected",(e) => this.sendGame(e));
        document.addEventListener("db-newgame",(e) => this.confirmDB(e));
        document.addEventListener("db-move",(e) => this.confirmDB(e));
    }

    sendGame(e){
        console.log(`it worky`);
        this.ws.makeGame('solitaire','test','1',this.jsonSaveList);
    }

    confirmDB(e){
        console.log(e);
        if(e.detail.action == 'newgame') this.id = e.detail.response;
    }

    connectedCallback() {
        if (this.init == 1) {
            //import css 
            importCss('./board.css');

            //get localstorage for options if no storage set defoult options
            if(!this.options)this.setDefaultOptions();

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
                    this.addEventListener("touchstart", (evt) => this.dragStartHandler(evt));
                    document.addEventListener("touchmove", (evt) => this.onMouseMove(evt));
                    this.addEventListener("touchend", (evt) => this.touchEndHandler(evt));
                }
            }
            setTimeout(() => {
                this.toggleAttribute('hidden',false);   
            });
            this.init = 0;
        }
    }

    get selectedCards() {
        return Array.from(document.querySelectorAll("[selected]"));
    }

    get cards(){
        return Array.from(document.querySelectorAll(`play-card`));
    }

    get deck(){
        return this.querySelector(`[deck]`).deck;
    }

    get dragPile(){
        return this.querySelector(`#dragdiv`);
    }
    get cardPiles(){
        return this.querySelectorAll(`card-pile:not(#dragdiv)`);
    }

    get saveList(){
        const arr = [];
        this.cardPiles.forEach(pile => {
            let sarr = [];
            pile.cards.forEach(card =>{
                sarr.push(card.cid);
            })
            arr.push(sarr);
        })
        return arr;
    }

    set saveList(list){
        for(let i = 0; i < list.length;i++){
            list[i].forEach(cid => {
                let card = this.deck.find(cid)
                this.cardPiles[i].append(card);
                //the last char uppercase state indicates flipped state
                cid[cid.length -1] == cid[cid.length -1].toLowerCase()?card.view == 'back' && card.flip(): card.view == 'front' && card.flip();
            })
        }
    }

    get jsonSaveList(){
        return JSON.stringify(this.saveList);
    }

    
/*
                           localstorage options
*/
    get options(){
        return JSON.parse(localStorage.getItem(this.nodeName.toLowerCase()));
    }

    get optionDraw(){
        return +this.options[0].split("=")[1];
    }

    get defaultOptions(){
        return [`draw=1`,`testoption=klaas`];
    }

    setDefaultOptions(){
        localStorage.setItem("rt-board", JSON.stringify(this.defaultOptions));
    }

    get ws(){
        return document.ws;
    }

/*
                            end localstorage options
*/

    clickHandler(e) {
        if(e.pointerId == 1){
            if(e.target.selected){
                //duble klick
                const suit = e.target.suit;
                const pile = document.querySelector(`card-pile[suit=${suit}]`);
                pile.cardClick(e);
            }
            else{
                typeof e.target.cardClick == "function"? e.target.cardClick(e) : this.clearSelected();
            }
        }
    }
    dragStartHandler(e) {
        const dt = e.dataTransfer
        const card = e.target;
        this.oldParent = card.parentElement;
        // prefent contextmenu for touch event 
        if(e.type == "touchstart")e.preventDefault();

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
            endElement.cardClick(e);
        } else {
            this.clearSelected();
        }
    }

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

/*******************************************************************************************************************************************************************************
 *                                                  solitaire board functionalety
 ******************************************************************************************************************************************************************************/

    showRules(){
        const rules = `De kaartreeksen op de speelstapels dienen daar aflopend worden geplaatst. De kaartkleuren dienen om-en-om (rood en zwart) gebruikt worden. U kunt hele reeksen of delen daarvan verplaatsen als de eerste kaart op een andere stapel past.

        Op een vrije stapel kunt u een Heer van elke kleur plaatsen of een kaartenreeks die begint met een Heer.`;
        window.alert(rules);
    }

    showOptions(){

    }

    undoMove(){
        const undoMsgField = document.getElementById("undoinfo");
        undoMsgField.innerText = "";
        if(this.moves.length > 0){
            const lastmove = this.moves.pop();
            const[to,from,cards,type] = lastmove;

            //undomove
            switch(type){
                case 2:
                    // undo drawcard
                    to.prepend(...cards)
                break;
                case 3:
                    //undo drawcard reset
                    to.append(...cards);
                break;
                default:
                    if(type)to.lastElementChild.flip();
                    to.append(...cards);
                break;
            }
            
        }else{
            undoMsgField.innerText = "no undomoves";
        }
    }
    
    record(from,to,cards,flip){
        this.moves.push([from,to,cards,flip]);
       if(this.ws)this.ws.move(this.id,JSON.stringify(this.moves.slice(-1)),this.jsonSaveList);
       if(document.getElementById("undoinfo").innerText.length > 0)document.getElementById("undoinfo").innerText = '';
    }
    
    checkWin(test = false){
        const backCards = this.querySelectorAll(`.solitairefield .flipped`);
        const drawpile = document.getElementById("drawpile");
        const placepile = document.getElementById('placepile');
        const check = backCards.length == 0? true : false;
        //check carddrawamount 
        const drawcheck = (this.optionDraw ==3 && drawpile.cardCount == 0 && placepile.cardCount <= 1)||(this.optionDraw == 1)? true : false;

        if((check && drawcheck) || test){
            this.completeWin();
            setTimeout(() => {
                window.alert("u heeft gewonen");
            },1200);
        }
        return check;
    }
    
    completeWin(){
        this.clearSelected();
        const cards = this.cards.sort((a,b) =>{ 
            return a.index - b.index;
        });
        for(const card of cards){
            if(!card.parentElement.hasAttribute("suit")){
                const pile = document.querySelector(`card-pile[suit=${card.suit}]`);
                if(card.view == 'back')card.flip();
                card.toggleSelected(true);
                pile.rules? pile.animateCard(card.parentElement,pile,[card],true) : console.error(`card = ${card} the pile its trying = ${pile}`) ;
                this.clearSelected();
            }
        }
        if(this.ws) this.ws.endGame(this.id,"win");
    }

/*******************************************************************************************************************************************************************************
 *                                                end  solitaire board functionalety
 ******************************************************************************************************************************************************************************/

}customElements.define("rt-board", Board);
export { Board };
console.log("board.js loaded");