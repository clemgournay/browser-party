class Player {

    constructor(game, name) {
        this.game = game;
        this.name = (name) ? name : 'Unkown';
        this.id = new Date().getTime();
        this.position = {block: 0, way: 0, case: 0};
        this.prevPosition = JSON.parse(JSON.stringify(this.position));
        this.stars = 0;
        this.coins = 10;
        this.rank = 1;
        this.moveInProgress = false;
        this.myTurn = false;
    }

    updateCoins(value) {
        this.coins += value;
        if (this.coins < 0) {
            this.coins = 0;
        } else if (this.coins >= 100) {
            this.stars += 1;
            this.coins = this.coins - 100;
        }
        this.game.updateRank();
    }

    updatePosition(nextPos) {
        this.prevPosition = JSON.parse(JSON.stringify(this.position));
        this.position = {
            block: nextPos.block,
            way: nextPos.way,
            case: nextPos.case
        };
    }

    canBuyStars(value) {
        const price = value * this.game.board.starPrice;
        return (this.coins >= price);
    }

    buyStars(value) {
        const price = value * this.game.board.starPrice;
        this.coins -= price;
        this.updateStars(value);
        this.game.UI.updatePlayerScore(this);
    }

    updateStars(value) {
        this.stars += value;
        this.game.updateRank();
    }

}

export { Player };