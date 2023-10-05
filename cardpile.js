//make  the deck encopes all stacked group of cards and interactions like draw shuffle exhaust order some in fliped state ect
import { importCss } from "./functions.js";
import { Deck } from "./deck.js";
import { values, suits } from "./card.js";

/*
    cardpile classes
        view :          how the stack is shown "row" "col" "stack"      default is "row"
        rotate          give a angle in deg "90"                        default is "0"
        back            give the collor for the backside                defoult is "red"
        show            wich side needs to be shown "front" "back"      default is "front"
        deck            if u want to make a whole deck of cards         "new" "shuffle" 
        aceptrules
        startrules

*/

/*todo 

*/
class Pile extends HTMLElement {
    constructor() {
        super();
        if (this.hasAttribute("deck")) {
            // make a deck of cards when it has the atribute
            this.deck = new Deck(false);
            switch (this.getAttribute("deck")) {
                case "new":
                    this.append(...this.deck.cards);
                    break;
                case "shuffle":
                    this.deck.shuffle();
                    this.append(...this.deck.cards);
                    break
            }
        }
        if (this.hasAttribute("startRules")) {
            this.getAttribute("startRules")
                .split(",")
                .map(rule => {
                    switch (true) {
                        case (+rule == rule):
                            const deck = document.querySelector("[deck]");
                            deck.drawcard(this, rule);
                            break;
                        case (rule == "showLast" || rule == "showlast"):
                            this.flip(rule);
                            break;
                    }
                })
        }
        if (this.hasAttribute("suit")) {
            //make a background image with the suit for the pile
            const suit = this.getAttribute("suit");
            const html = /*html*/`<card-t cid="f${suit.charAt(0)}"></card-t>`;
            this.insertAdjacentHTML("afterbegin", html);
            const node = this.getElementsByTagName("card-t")[0];
            const img = node.firstChild.src;
            this.style = `background-image: url("${img}") ;`;
            this.removeChild(node);

        }
        this.init = 1;
    }
    connectedCallback() {
        if (this.init == 1) {
            //import css
            importCss('./cardpile.css');
            if (this.hasAttribute("acceptRules")) {
                // check if multiple is a aceptrule if not put single in
                this.getAttribute("acceptRules").includes("multiple") ? "" : this.setAttribute("acceptRules", this.getAttribute("acceptRules").concat(",single"));
            }
            if (this.board.hasAttribute("drag")) {
                //if we want dragin add the eventlistners and stops the drag on draw piles (so we dont draw and return the card at same time) 
                //! getatribute('click') makes eror if no click need to solve ?
                if (this.board.getAttribute("drag") == "true" && !this.getAttribute('click')?.startsWith("draw") ) {
                    this.addEventListener("dragover", (evt) => this.dragoverHandler(evt));
                    this.addEventListener("drop", (evt) => this.cardClick(evt))
                }
            }
            this.init = 0;
        }
    }


    dragoverHandler(e) {
        e.preventDefault();
        return false;
    }

    hasRule(rule) {
        return this.getAttribute("acceptRules")
            .split(",")
            .includes(rule);
    }

    closestElement(selector, el = this) {
        return (
            (el && el != document && el != window && el.closest(selector)) ||
            this.closestElement(selector, el.getRootNode().host)
        );
    }
    get board() {
        return this.closestElement("rt-board");
    }
    //getters for rules
    get rules() {
        const cards = this.board.selectedCards;
        const TFarr = [];
        this.hasRule("higer")? cards.sort(this.sortLH) : cards.sort(this.sortHL) ;
        for (const card of cards) {
            this.firstCard = cards.indexOf(card) - 1 < 0 ? this.lastCard : cards[cards.indexOf(card) - 1];
            this.secondCard = card;
            let tf = this.getAttribute("acceptRules")
                .split(",")
                .map(rule => {
                    //errorhandling
                    if (this[rule] == undefined) console.error("acceptRules ", rule, " is wrong");
                    return this[rule]
                })
                .every(TF => {
                    return TF === true
                });
            TFarr.push(tf);
        }
        return TFarr.every(a => { return a === true });
    }

    get lastCard() {
        if (this.lastElementChild) return this.lastElementChild;
        else {
            const x = document.createElement("play-card");
            x.rank = this.getAttribute("acceptRules").includes("lower") ? values.length : -1;
            x.suit = this.getAttribute("suit");
            return x;
        }
    }

    get cardCount() {
        return this.cards.length;
    }

    get firstCardcolor() {
        // returns the color of the last card in the pile
        // or "undefined" when there is no card in the pile
        return this.firstCard.color;
    }
    get any() {
        return true
    }
    get otherColor() {
        if (this.firstCardcolor == false) return true;
        return this.firstCardcolor != this.secondCard.color ? true : false;
    }
    get sameColor() {
        if (this.firstCardcolor == false) return true;
        return this.firstCardcolor == this.secondCard.color ? true : false;
    }

    get cardValues() {
        let value = 0;
        for (const card of this.cards) {
            value += card.value;
        }
        return value;
    }

    //for rank ace wil get funky being the lowest and higest
    get higher() {
        return this.firstCard.index + 1 == this.secondCard.index ? true : false;
    }
    get lower() {
        return this.firstCard.index - 1 == this.secondCard.index ? true : false;
    }
    get sameSuit() {
        return this.firstCard.suit == this.secondCard.suit ? true : false;
    }
    get otherSuite() {
        return this.firstCard.suit != this.secondCard.suit ? true : false;
    }
    get cards() {
        return Array.from(this.getElementsByTagName('play-card'));
    }
    get multiple() {
        return this.board.selectedCards.length >= 1 ? true : false;
    }
    get single() {
        return this.board.selectedCards.length == 1 ? true : false;
    }

    cardClick(e) {
        //pile has been clicked now look at the rules and execute them
        const [action, id, empty] = this.getAttribute("click") ? this.getAttribute("click").split(",") : "";
        const to = document.getElementById(id);
        const emptypile = document.getElementById(empty);
        const card = e.target.nodeName == "PLAY-CARD" ? e.target : this.lastElementChild;
        switch (action) {
            case "draw":
                this.board.clearSelected();
                //solitaire this.board.optionDraw
                this.cards.length != 0 ? this.drawcard(to,this.board.optionDraw) : emptypile.drawcard(this, "all");
                break;
            case "select":
                // if thers already a selected card see if its from a difrent pile if zo unselect cards
                if (this.board.selectedCards.length > 0) {
                    this.board.selectedCards[0].parentElement != this ? this.board.clearSelected() : this.selectcheck(card);
                } else {
                    this.selectcheck(card);
                }
                break;
            case "place":
                // check rules and if true place card
                this.rules == true ? this.placecard() : console.warn("not all rules were true");
                this.board.clearSelected();
                break;
            case "select_place":
                // if cards selected try place otherwise select
                if (this.board.selectedCards.length > 0) {
                    //try place
                    this.rules == true ? this.placecard() : console.warn("not all rules were true");
                    this.board.clearSelected();
                } else {
                    //try select
                    this.selectcheck(card);
                }
                break;
            default: this.board.clearSelected();

        }
    }

    selectcheck(card) {
        //used by the klick="select" functionalety
        if (card != null) {
            if (card.selected) this.board.clearSelected();
            else if (this.hasAttribute("selectRules")) {
                switch (this.getAttribute("selectRules")) {
                    case "below":
                        card.toggleSelected(true);
                        while (card.nextElementSibling) {
                            card = card.nextElementSibling;
                            card.toggleSelected(true);
                        }
                    break;
                    case "above":
                        card.toggleSelected(true);
                        while (card.previousElementSibling) {
                            card = card.previousElementSibling;
                            card.toggleSelected(true);
                        }
                    break;
                    case "choice":
                        card.toggleSelected();
                    break;
                    case "last":
                        this.lastElementChild.selected? this.lastElementChild.toggleSelected(false) : this.lastElementChild.toggleSelected(true) ;
                        
                    break;

                }
            }
            else if (!card.selected) {
                this.board.clearSelected();
                card.toggleSelected();
            }
            //check selectRules if true select acordengly
        }
    }

    // place selected cards
    placecard(where = "top") {
        const cards = this.board.selectedCards;
        let oldParent = cards[0].parentElement;
        let flip = 0;
        if (where == "top") {
            // this.append(...cards);
            this.animateCard(cards[0].parentElement, this, cards);
        } 
        else if (where == "bottom") {
            for (const card of cards) {
                this.insertBefore(card, this.firstElementChild);
            }
        } else if (where > 0) {
            //place on x amount from top 1 stil is top
            const deck = this.getElementsByTagName('play-card');
            const length = deck.length;
            for (const card of cards) {
                this.insertBefore(card, deck[length - where + 1]);
            }
        } else if (where < 0) {
            //place on x amount from bottom
            const deck = this.getElementsByTagName('play-card');
            for (const card of cards) {
                this.insertBefore(card, deck[Math.abs(where)]);
            }
        }

        //cards are placed handle secondarys like flip pref parrent or sort
        if (oldParent.id == "dragdiv") oldParent = this.board.oldParent;
        if (oldParent.hasAttribute("startRules")) {
            if (oldParent.getAttribute("startRules").includes("showLast") && oldParent.lastCard.view == "back"){
                oldParent.flip("flipLast");
                flip = 1;
            } 
        }
        //solitaire
        this.board.checkWin();
        //sort cards in order if it has atribute sort
        if (this.hasAttribute("sort")) this.sortCards(this.getAttribute("sort"));
        this.board.record(oldParent,this,cards,flip)
    }

    animateCard(from, to, cards, slow = false) {
        for (const card of cards) {
            //get cords where the cards is
            const [x0, y0] = [card.getBoundingClientRect().x, card.getBoundingClientRect().y];
            //get cords where the cards has to go
            to.append(card);
            const [x1, y1] = [card.getBoundingClientRect().x, card.getBoundingClientRect().y];
            from.append(card);
            // calcutlate distanse and using that to get a time so cards move at a constant speed 
            const duration = Math.sqrt(Math.pow(Math.abs(x0 - x1), 2) + Math.pow(Math.abs(y0 - y1), 2)) * (slow ? 1.5 : 0.5);
            

            card.animate(
                [{ zIndex: 1, transform: `translate(${x0 - x1}px,${y0 - y1}px)` }, { zIndex: 1, transform: `translate(0)` }],
                {
                    duration: duration,
                    easing: "linear",
                }
            );
            //when animation finishd apend to new cardpile
            to.append(card);
        }
    }

    // get cards from this pale and place to another
    drawcard(to, amount = 1,where = "bottom") {
        //multiple cards only work at top and bottom where
        const deck = this.getElementsByTagName('play-card');
        const length = deck.length;
        const cards = [];
        switch (true) {
            case (amount == "all"):
                cards.push(...deck);
                to.append(...deck);
                break;
            case (where == "top"):
                let card = deck[length - amount];
                cards.push(card);
                while (card.nextElementSibling) {
                    card = card.nextElementSibling;
                    cards.push(card);
                }
                break;
            case (where == "bottom"):
                for (let i = 0; i < amount; i++) {
                    if(deck[i])cards.push(deck[i]);
                }
                break;
            case (where > 0):
                //draw x amount from top
                to.append(cards[length - where]);
                break;
            case (where < 0):
                //drad x amount from bottom
                to.append(cards[Math.abs(where) - 1]);
                break;
        }
        if(typeof this.board.record == "function"){
            const flip = cards.length < 1 ? 3 : 2;
            this.board.record(this,to,cards,flip)
        }
        to.append(...cards);
    }
    
    // sort suits from low to high then rank low to high
    sort1(a, b){
        if (suits.indexOf(a.suit) < suits.indexOf(b.suit)) {
            return -1;
        } else if (suits.indexOf(a.suit) == suits.indexOf(b.suit)) {
            return a.index < b.index ? -1 : 1;
        } else {
            return 1
        }
    }

    //sort suits then high to low
    sort2(a,b){
        if (suits.indexOf(a.suit) < suits.indexOf(b.suit)) {
            return -1;
        } else if (suits.indexOf(a.suit) == suits.indexOf(b.suit)) {
            return b.index - a.index;
        } else {
            return 1
        }

    }

    // only look at rank low to high
    sortLH(a, b){
        return a.index - b.index;
    }

    // only look at rank high to low
    sortHL(a ,b){
        return b.index - a.index;
    }

    sortCards(method = "string") {
        //todo make more sorting methods
        const newcards = this.cards;
        switch(method){
            case "hl":
                //higl > low
                newcards.sort(this.sortHL);
            break;
            case "lh":
                // low > high
                newcards.sort(this.sortLH);
            break;
            case "shl":
                //suits > high > low
                newcards.sort(this.sort2);
            break;
            default:
                //suits > low > high
                newcards.sort(this.sort1);
            break;
        }
        this.append(...newcards);
    }


    shuffle() {
        //shuffels internal cards
        for (let i = this.childElementCount; i >= 0; i--) {
            this.append(this.children[Math.random() * i | 0]);
        }
    }

    rotate(deg = 0) {
        this.style.setProperty("--deg", deg + "deg");
    }
    flip(special = "") {
        const cards = this.cards;
        switch (special) {
            case "showLast":
                for (const card of cards) card.flip();
                cards[cards.length - 1].flip();
            break;
            case "flipLast":
                cards[cards.length - 1].flip();
            break;
            case "front":
                for(const card of cards){
                    if(card.view == "back")card.flip();
                }
            break;
            case "back":
                for(const card of cards){
                    if(card.view == "front")card.flip();
                }
            break;
            default:
                for (const card of cards) card.flip();
            break;
        }
    }

    makeAtribute(name, value) {
        let temp = document.createAttribute(name);
        temp.value = value;
        this.setAttributeNode(temp);
    }

} customElements.define("card-pile", Pile);
export { Pile };
console.log("cardpile.js loaded");