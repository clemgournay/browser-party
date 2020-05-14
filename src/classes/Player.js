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

    updateCoins(value) {
        this.coins += value;
        if (this.coins < 0) {
            this.coins = 0;
        } else if (this.coins >= 100) {
            this.stars += 1;
            this.coins = this.coins - 100;
        }
    }

    canBuyStar() {
        console.log(this.coins, this.game.board.starPrice)
        return (this.coins >= this.game.board.starPrice);
    }

    updateStars(value) {
        this.stars += value;
    }


}

export { Player };