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
            this.moveInProgress = true;
            this.game.board.hitDice();
        }
    }

    updatePosition(nextPos) {
        this.prevPosition = JSON.parse(JSON.stringify(this.position));
        this.position = {
            block: nextPos.block,
            way: nextPos.way,
            case: nextPos.case
        };
    }

}

export { MainPlayer };