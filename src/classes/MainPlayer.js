import { Player } from './Player.js';

class MainPlayer extends Player {

    constructor(game) {
        super(game);
        this.id = this.generateID();
    }

    generateID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    stopDice() {
        if (!this.moveInProgress) {
            this.game.diceRolling = false;
            const score = Math.floor(Math.random() * 6) + 1;
            this.moveInProgress = true;
            this.game.board.showDiceResult(score);
        }
    }

}

export { MainPlayer };