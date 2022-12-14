import { Card , suits,values } from "./rt-card.js";

const board = document.querySelector("rt-board");
const template = document.createElement("template");
template.innerHTML=`
    <draw-pile class="newdeck"></draw-pile>
    <discard-pile></discard-pile>
`;

class drawPile extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
    }

    drawcard(){
        return this.firstChild;
    }

    getcards(){
        if(this.getElementsByTagName("rt-card")){
            return this.getElementsByTagName("rt-card");
        }else{

        }
    }

    init(cards){
        for(const card of cards){
            this.append(card);
            card.flip();
        }
    }

}
customElements.define("draw-pile",drawPile);

class discardPile extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){

    }

    getcards(){
        if(this.getElementsByTagName("rt-card")){
            return this.getElementsByTagName("rt-card");
        }else{

        }
    }
}
customElements.define("discard-pile",discardPile);

class   deck extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        //make drawpile and discardpile
        this.append(template.content.cloneNode(true));
        const drawPile = this.querySelector("draw-pile");
        const discardPile = this.querySelector("discard-pile");
        

        //import css
        var cssId = 'rt-deck';  // you could encode the css path itself to generate id..
        if (!document.getElementById(cssId)){
            var head  = document.getElementsByTagName('head')[0];
            var link  = document.createElement('link');
            link.id   = cssId;
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = './rt-deck.css';
            link.media = 'all';
            head.appendChild(link);
        }


    }
    

    newDeck(){
        const deck = [];
        for( let key of suits){
          for(let val of values){
            deck.push(new Card(key, val));
          }
        }
        this.shuffle(deck);
        return deck;
    }

    shuffle(array){
        let curentIndex = array.length, randomIndex;
        while(curentIndex != 0){
            randomIndex = Math.floor(Math.random()* curentIndex);
            curentIndex --;
    
            [array[curentIndex], array[randomIndex]] = [array[randomIndex], array[curentIndex]];
        }
        return array;
    }

    draw(drawPile = this.firstElementChild,discardPile = this.lastElementChild){
        //draw card from pile if empty push the discard pile on it again
        if(drawPile.firstElementChild){
            const drawcard = drawPile.drawcard();
            drawcard.flip();
            discardPile.append(drawcard);
            board.moves.push("drawCard");
        }else{
            const newPile = discardPile.getcards();
            for(const card of newPile){
                card.flip();
            }
            drawPile.append(...newPile);
            board.moves.push("newDeck");
        }
        this.removeSelect();
    }

    select(discardPile = this.lastElementChild){
        const board = document.querySelector("rt-board"); 
        if(discardPile.lastChild){
            const card = (discardPile.lastChild);
            board.selectedCard(card);
        }else{
            this.removeSelect();
        }
    }
    removeSelect(){
        document.querySelector("rt-board").removeSelected();
    }

}
customElements.define("rt-deck",deck);
export {deck};