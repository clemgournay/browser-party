import { Player } from './Player.js';

class MainPlayer extends Player {

    constructor(game) {
        super(game);
        this.id = this.generateID();
    }

    generateID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    rollDice() {
        const score = Math.floor(Math.random() * 6) + 1;
        console.log(score);
        this.game.board.moveToCase(score - 1);
    }

}

export { MainPlayer };