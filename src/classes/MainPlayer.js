import { Player } from './Player.js';

class MainPlayer extends Player {

    constructor(game) {
        super(game);
        console.log(this.moveInProgress)
        this.id = this.generateID();
    }

    generateID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    stopDice() {
        if (!this.moveInProgress) {
            this.moveInProgress = true;
            this.game.board.hitDice();
        }
    }

}

export { MainPlayer };