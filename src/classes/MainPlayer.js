import { Player } from './Player.js';

class MainPlayer extends Player {

    constructor(game) {
        super(game);
        this.id = this.generateID();
    }

    generateID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

}

export { MainPlayer };