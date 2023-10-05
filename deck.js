import {Card, suits , values} from "./card.js";

class Deck {
    constructor(shuffle = true , joker = 0){
        this.cards = this.newDeck(shuffle, joker) ;
    }
    
    newDeck(shuffle, joker){
        const deck = [];
        for( let key of suits){
            for(let val of values){
            deck.push(new Card(key, val));
            }
        }
        shuffle? this.shuffle(deck): "" ;
        return deck;
    }
    
    shuffle(array = this.cards){
        let curentIndex = array.length, randomIndex;
        while(curentIndex != 0){
            randomIndex = Math.floor(Math.random()* curentIndex);
            curentIndex --;
    
            [array[curentIndex], array[randomIndex]] = [array[randomIndex], array[curentIndex]];
        }
        return array;
    }

    find(cid){
        for(const card of this.cards){
            if(card.cid.toLowerCase() == cid.toLowerCase())return card;
        }
    }
}

export{Deck};