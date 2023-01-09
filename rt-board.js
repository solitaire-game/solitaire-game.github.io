/*
js element animate link search
https://www.google.com/search?q=move+elements+with+the+animation+api&rlz=1C1GCEA_en&oq=move+elements+with+the+animation+api&aqs=chrome..69i57j33i160.8671j0j4&sourceid=chrome&ie=UTF-8
*/
import "./rt-deck.js";
import {Card, suits,values} from "./rt-card.js";
const board = document.querySelector("rt-board");

//! telraam voor tijd van dag aan onderdeelen als sterchart.

class FoundationPile extends HTMLElement{
    constructor(id){
        super();
        id? this.id = id : this.id ;
    }

    connectedCallback(){

        //make floor tile of given id and give it rank-1 so a ace is above it
        this.innerHTML=/*html */`
            <card-t cid="f${this.id.charAt(0)}" rank="-1"></card-t>
        `;

        this.addEventListener("dragenter", this.dragenterHandler.bind(this));
        this.addEventListener("dragover", this.dragoverHandler.bind(this));
        this.addEventListener("drop", this.dropHandler.bind(this));
        // this.addEventListener("touchend", this.dropHandler.bind(this));
    }

    dragoverHandler(e){
        e.preventDefault();
        return false;
    }

    dropHandler(e){
        // give true couse we have a drop
        this.select(board.selected,true);
    }

    dragenterHandler(e){
        
    }

    select(card = board.selected ,drop=false){
        //see if thers a card selected and is it alowed here
        if(card.id){
            if(this.check(card)){
                board.moveCard(this,drop);
            }
            board.removeSelected();
        }else if(this.lastElementChild.nodeName == "RT-CARD"){
            this.lastElementChild != card? board.selectedCard(this.lastElementChild) : board.removeSelected() ;
        }else{
            board.removeSelected();
        }
    }

    check(card){
        if(values.indexOf(card.rank) == values.indexOf(this.lastElementChild.rank) +1 && board.selectedSiblings.length < 1 && board.selected.suit == this.id) return true;
        else return false;
    }

}customElements.define("foundation-pile",FoundationPile);

class SolitaireField extends HTMLElement{
    constructor(){
        super();

    }

    connectedCallback(){
        this.addEventListener("dragenter", this.dragenterHandler.bind(this));
        this.addEventListener("dragover", this.dragoverHandler.bind(this));
        this.addEventListener("drop", this.dropHandler.bind(this));
        // this.addEventListener("touchend", this.dropHandler.bind(this));
    }

    dragoverHandler(e){
        e.preventDefault();
        return false;
    }

    dropHandler(e){
        // give true couse we have a drop
        this.select(board.selected,true);
    }

    dragenterHandler(e){
        
    }

    select(card, drag = false){
        //see if we want to place or select a card
        console.log("select");
            if(board.selected.id){
              this.placeCard(drag);
            }else if(this.lastElementChild){
               this.selectCard(card);
            }
    }

    placeCard(drag){
          //check if thers already a card to check
          if(this.lastElementChild){
            if(this.checkCollor(board.selected) == 1 && this.checkRank(board.selected) == 1){
                    board.moveCard(this,drag);
            }
        }
        else if(board.selected.rank == values[values.length-1]){
            //this is a king
            board.moveCard(this ,drag);
        }
        //actions have been done clear the selected value
        board.removeSelected();
    }

    selectCard(card){
        //check if the card is already selcted and ur not selecting a hidden card
        if(card != board.selected && !card.getElementsByClassName("inner")[0].classList.contains("flipped") ){
            board.selectedCard(card);
            //check if we selected a card with cards below it
            if(card.nextElementSibling){
                let nextCard = card.nextElementSibling;
                //go true all the cards below and put in the array
                while(nextCard.nodeName == "RT-CARD"){
                    board.selectedSiblings.push(nextCard);
                    nextCard.select()
                    nextCard.nextElementSibling? nextCard = nextCard.nextElementSibling: nextCard = document.createElement("div");
                }
            }
        }else{
            console.log("selectcard");
            board.removeSelected() ;
        } 
    }

    checkCollor(card){
        let diffrentCollor = 0
        switch(card.suit){
            case "spades":
                if(this.lastElementChild.suit == "hearts" || this.lastElementChild.suit == "diamonds"){
                    diffrentCollor = 1;
                }
            break;
            case "clubs":
                if(this.lastElementChild.suit == "hearts" || this.lastElementChild.suit == "diamonds"){
                    diffrentCollor = 1;
                }
            break;
            case "hearts":
                if(this.lastElementChild.suit == "spades" || this.lastElementChild.suit == "clubs"){
                    diffrentCollor = 1;
                }
            break;
            case "diamonds":
                if(this.lastElementChild.suit == "spades" || this.lastElementChild.suit == "clubs"){
                    diffrentCollor = 1;
                }
            break;
        }
        return diffrentCollor
    }

    checkRank(card){
        if(values.indexOf(card.rank) +1 == values.indexOf(this.lastElementChild.rank)){
            return 1;
        }else{
            return 0;
        }
    }

    //this is called when a card is taken from a solitaireField
    flip(){
        //if thers a pref card check if its flipped then unflip if true
        if(this.lastElementChild){
            const prevCard = this.lastElementChild
            if(prevCard.getElementsByClassName("inner")[0].classList.contains("flipped")){
                this.lastElementChild.flip();
                // return true if flip has happend
                return 1;
            } 
                
        }
        return 0;
    }

    init(cards){
        //plases the cards and flips m
        for(const card of cards){
            this.append(card);
            card.flip();
        }
        // show the last card
        this.lastElementChild.flip()
    }

}customElements.define("solitaire-field",SolitaireField)

class Board extends HTMLElement{
    constructor(){
        super();
        this.selected = document.createElement("rt-card");
        this.selectedSiblings = [];
        this.moves = [];
        this.redoMoves = [];
        this.oldParent = "";
        this.init = 1;
    }
    connectedCallback(){

        //import css
        var cssId = 'rt-board';  // you could encode the css path itself to generate id..
        if (!document.getElementById(cssId)){
            var head  = document.getElementsByTagName('head')[0];
            var link  = document.createElement('link');
            link.id   = cssId;
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = './rt-board.css';
            link.media = 'all';
            head.appendChild(link);
        }
        
        //opset start maaken
        if(this.init == 1){
        this.innerHTML= /*html*/`
            <rt-deck></rt-deck>
            <fieldset>
            <legend>options</legend>
            <button onclick="document.querySelector('rt-board').undoMove()"><p>undo</P></button>
            <span id="undoinfo"></span>
            <button onclick="document.querySelector('rt-board').redoMove()"><p>redo</P></button>
            </fieldset>
            <foundation-pile id="spades"></foundation-pile>
            <foundation-pile id="hearts"></foundation-pile>
            <foundation-pile id="clubs"></foundation-pile>
            <foundation-pile id="diamonds"></foundation-pile>
            <solitaire-field></solitaire-field>
            <solitaire-field></solitaire-field>
            <solitaire-field></solitaire-field>
            <solitaire-field></solitaire-field>
            <solitaire-field></solitaire-field>
            <solitaire-field></solitaire-field>
            <solitaire-field></solitaire-field>
            <solitaire-field id="dragdiv"></solitaire-field>
        `;
            //deck maaken, huselen en verdelen over de elements
            const deck = this.firstElementChild.newDeck();
            const fields = this.getElementsByTagName("solitaire-field");
            for(let i = 0 ; i<7 ; i++){
                const cards = [];
                for(let x =0; x <=i; x++){
                    cards.push(deck.shift())
                    deck
                }
                fields[i].init(cards);
            }
            this.firstElementChild.firstElementChild.init(deck);
            this.addEventListener("click", this.klickEvent.bind(this));
            this.addEventListener("dragstart", this.dragstartHandler.bind(this));
            this.addEventListener("touchstart", this.dragstartHandler.bind(this));
            document.addEventListener("dragover", this.onMouseMove.bind(this));
            document.addEventListener("touchmove", this.onMouseMove.bind(this));
            this.addEventListener("dragend", this.dragendHandler.bind(this));
            this.addEventListener("touchend", this.touchendHandler.bind(this));
            this.init = 0;
        }

    }

    klickEvent(e){
        let parentElement = e.target;
        let card = 0;
        if(e.target.nodeName == "RT-CARD"){
            card = e.target;
            parentElement = card.parentElement;
        }

        //dubble click a card check if foundation pile is placeble else default click functions
        if(card == this.selected){
            document.getElementById(card.suit).select();
        }else{
            switch (parentElement.nodeName){
                case"DRAW-PILE":
                    parentElement.parentElement.draw();
                break;
                case"DISCARD-PILE":
                    parentElement.parentElement.select();
                break;
                case"FOUNDATION-PILE":
                    parentElement.select();
                break;
                case"SOLITAIRE-FIELD":
                    parentElement.select(card);
                break;
                default:
                    this.removeSelected() 
                break;
            }
        }

    }

    dragstartHandler(e){
        const dt = e.dataTransfer
        const drags = [];
        const card = e.target;
        this.oldParent = card.parentElement;
        if(card.draggable && card.nodeName == "RT-CARD"){

            if(card == this.selected)this.removeSelected();
            drags.push(card);
            this.selectedCard(card);
    
            //check if touchevent has a flipped card
    
           
           //select siblings
           if(card.nextElementSibling && card.parentElement.nodeName == "SOLITAIRE-FIELD"){
               let nextCard = card.nextElementSibling;
               //go true all the cards below and put in the array
               while(nextCard.nodeName == "RT-CARD"){
                   this.selectedSiblings.push(nextCard);
                   drags.push(nextCard);
                   nextCard.select();
                   nextCard.nextElementSibling? nextCard = nextCard.nextElementSibling: nextCard = document.createElement("div");
                }
            }
    
    
            
            //set the cards to follow mouse
            const mdiv = document.getElementById("dragdiv");
            //calc the position of the mouse on the card
            const i = e.clientX? e : e.changedTouches[0] ;
            const xline = i.clientX - e.target.getBoundingClientRect().x ;
            const yline = i.clientY - e.target.getBoundingClientRect().y ;
            mdiv.style.setProperty("--xline",`${xline}px`);
            mdiv.style.setProperty("--yline",`${yline}px`);
            mdiv.style.left = `calc(${i.clientX}px - var(--xline))`;
            mdiv.style.top = `calc(${i.clientY}px - var(--yline))`;
            
            //make a no ghost
            if(e.type != "touchstart"){
                //need a setTimeout otherwise the dragevent fails
                setTimeout(function(){
                    for(const drag of drags){
                        mdiv.append(drag);
                    }
                });
                
                const img = document.createElement("img");
                dt.setDragImage(img,0,0);
            }else{
                // no delay for the touch event
                    for(const drag of drags){
                        mdiv.append(drag);
                    }
            }
        }else{
            // when no dragable card element found
            return;
        }

    }

    onMouseMove(e){
        const mdiv = document.getElementById("dragdiv");
        if(e.clientX){
            mdiv.style.left = `calc(${e.clientX}px - var(--xline))`;
            mdiv.style.top = `calc(${e.clientY}px - var(--yline))`;
        }else{
            mdiv.style.left = `calc(${e.changedTouches[0].clientX}px - var(--xline))`;
            mdiv.style.top = `calc(${e.changedTouches[0].clientY}px - var(--yline))`;
        }
        return false;
    }

    dragendHandler(e){
        this.removeSelected();
    }
    
    touchendHandler(e){
        let endElement = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        if(endElement.nodeName == "RT-CARD")endElement = endElement.parentElement;
        if(endElement.nodeName == "FOUNDATION-PILE" || endElement.nodeName == "SOLITAIRE-FIELD"){
            console.log("touchend");
            endElement.select(this.selected,true);
        }else{
            this.removeSelected();
        }
    }



    record(from , to ,card, siblings,flip){
        this.moves.push([from,to,card,siblings,flip]);
    }

    moveCard(to, drop = false){
        //clear the undoinfo if ther is any
        document.getElementById("undoinfo").innerText = "";

        const card = this.selected;
        const prev = card.parentElement != document.getElementById("dragdiv")? card.parentElement : this.oldParent ;
        let flip = 0
        drop == false ? this.animateCard(card.parentElement,to,card): to.append(card);
        if(this.selectedSiblings.length > 0){
            if(drop == false){
                let gap = 1;
                for(const sibcard of this.selectedSiblings){
                    this.animateCard(card.parentElement,to,sibcard,gap);
                    gap++;
                }
            }else{
                to.append(...this.selectedSiblings);
            }
    
        }
        // to.append(...this.selectedSiblings);
        if(prev.nodeName == "SOLITAIRE-FIELD"){
            flip =  prev.flip();
        }
        this.record(prev,to,card,this.selectedSiblings,flip);
        this.checkWin();
    }
    
    undoMove(){
        const undoMsgField = document.getElementById("undoinfo");
        undoMsgField.innerText = "";
        if(this.moves.length > 0){
            const lastmove = this.moves.pop();
            const drawPile = this.querySelector("draw-pile");
            const discardPile = this.querySelector("discard-pile");
            //undomove
            if(typeof lastmove == "object"){
                const[to,from,card,sibblings,flip] = lastmove;
                if(flip)to.lastElementChild.flip();
                to.append(card);
                to.append(...sibblings);
            }
            else if(lastmove == "drawCard"){
                const card = discardPile.lastElementChild;
                card.flip();
                drawPile.insertBefore(card,drawPile.firstElementChild);
            }
            else if(lastmove == "newDeck"){
                while(drawPile.firstElementChild.nodeName == "RT-CARD"){
                    let card = drawPile.firstElementChild;
                    discardPile.append(card);
                    card.flip();
                }
            }
            
        }else{
            undoMsgField.innerText = "no undomoves";
        }
    }
    
    redoMove(){
        //todo
    }
    animateCard(from , to , card, gap = 0){
        const [x0,y0] = [card.getBoundingClientRect().x,card.getBoundingClientRect().y];
        to.append(card);
        const [x1,y1] = [card.getBoundingClientRect().x,card.getBoundingClientRect().y];
        from.append(card);
        const distance = Math.sqrt(Math.pow(Math.abs(x0-x1),2)+Math.pow(Math.abs(y0-y1),2))*0.5;

        card.animate(
            [{zIndex:1,transform: `translate(${x0-x1}px,calc(${y0-y1}px + (${gap} * var(--cardGap))))`},{zIndex:1,transform: `translate(0)`}],
            {
                duration:distance,
                easing:"linear",
                // fill:"forwards",
            }
        );
        to.append(card);
    }


    checkWin(){
        const backCards = this.getElementsByClassName("flipped") ;
        const check = backCards.length == 0? true : false;
        if(check){
            //todo add venster with victory screen and scores?
            this.completeWin();
            console.log("player wins");
            // alert("u won");
        }
        return check;
    }

    //make all remaining cards animate to the foundation-piles
    completeWin(){
        const heartsPile = document.getElementById("hearts");
        const spadesPile = document.getElementById("spades");
        const clubsPile = document.getElementById("clubs");
        const diamondsPile = document.getElementById("diamonds");
        const cards = document.getElementsByTagName("rt-card");
        for(const rank of values){
            for(const card of cards){
                if(card.parentElement.nodeName != "FOUNDATION-PILE" && card.rank == rank){
                    this.selectedCard(card);
                    switch(card.suit){
                        case "hearts":
                            heartsPile.select(card);
                        break;
                        case "spades":
                            spadesPile.select(card);
                        break;
                        case "clubs":
                            clubsPile.select(card);
                        break;
                        case "diamonds":
                            diamondsPile.select(card);
                        break;
                    }
                }
            }
        }
    }


    selectedCard(card){
        if(card != this.selected){
            this.removeSelected();
            this.selected = card
            card.id="selected";
        }else{
            this.removeSelected();
        }
    }

    removeSelected(){
        // return the cards to corect place if drag was ended unsucsesful
        if(this.selected.parentElement == document.getElementById("dragdiv")){
            console.log("removeselected");
            this.oldParent.append(this.selected);
            this.oldParent.append(...this.selectedSiblings); 
            this.oldParent = "";
        }
        this.selected.removeSelect();
        this.selected = document.createElement("rt-card");
        for(const card of this.selectedSiblings){
            card.removeSelect();
        }
        this.selectedSiblings = [];
    }

}
customElements.define("rt-board", Board);
export {board};