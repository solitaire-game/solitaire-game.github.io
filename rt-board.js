/*
js element animate link search
https://www.google.com/search?q=move+elements+with+the+animation+api&rlz=1C1GCEA_en&oq=move+elements+with+the+animation+api&aqs=chrome..69i57j33i160.8671j0j4&sourceid=chrome&ie=UTF-8
*/
import "./rt-deck.js";
import {Card, suits,values} from "./rt-card.js";
const board = document.querySelector("rt-board");



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
            this.addEventListener("dragend", this.dragendHandler.bind(this));
            this.addEventListener("touchend", this.dragendHandler.bind(this));
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
       const  dt = e.dataTransfer;
       const drags = [];
       const card = e.target;
       drags.push(card);
       this.selectedCard(card);
    //    console.log(e);
       
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
        
        //add the hiding orignal element
        //todo make div follow mouse put cards in div with from posistion
        setTimeout(function(){
            for(const drag of drags){
                drag.classList.add("dragging");
            }
        });

    }

    dragendHandler(e){
        e.target.classList.remove("dragging");
        this.removeSelected();
    }


    record(from , to ,card, siblings,flip){
        this.moves.push([from,to,card,siblings,flip]);
    }

    moveCard(to, drop = false){
        const card = this.selected;
        const prev = card.parentElement;
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
            //todo send msg to user to tell thers no moves to undo 
            console.log("no undomoves");
        }
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

    redoMove(){
        //todo
    }

    checkWin(){
        const backCards = this.getElementsByClassName("flipped") ;
        const check = backCards.length == 0? true : false;
        if(check){
            console.log("player wins");
            //todo add venster with victory screen and scores?
            this.completeWin();
        }
        return check;
    }

    //make all remaining cards animate to the foundation-piles
    completeWin(){
        const heartsPile = this.getElementById("hearts");
        const spadesPile = this.getElementById("spades");
        const clubsPile = this.getElementById("clubs");
        const diamondsPile = this.getElementById("diamonds");
        const cards = this.getElementsByTagName("rt-card");
        for(const rank of values){
            for(const card of cards){
                if(card.parentElement.nodeName != "FOUNDATION-PILE" && card.rank == rank){
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
        this.selected.removeSelect();
        this.selected = document.createElement("rt-card");
        for(const card of this.selectedSiblings){
            card.removeSelect();
            card.classList.remove("dragging");
        }
        this.selectedSiblings = [];
    }

}
customElements.define("rt-board", Board);
export {board};