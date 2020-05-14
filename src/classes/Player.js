class Player {

    constructor(game) {
        this.game = game;
        this.name = 'Unkown';
        this.id = 'test';
        this.position = 0;
        this.stars = 0;
        this.coins = 10;
        this.rank = 1;
        this.moveInProgress = false;
    }


}

export { Player };