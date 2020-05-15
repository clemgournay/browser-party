class Case {

    constructor(game, type, position, direction) {
        this.game = game;
        this.type = type;
        this.position = position;
        this.direction = direction;
        this.mesh = null;
    }

    action () {
        switch(this.type) {
            case 'blue':
                this.game.mainPlayer.updateCoins(this.game.board.blueCaseValue);
                break;
            case 'red':
                this.game.mainPlayer.updateCoins(this.game.board.redCaseValue);
                break;
            case 'star':
                if (this.game.mainPlayer.canBuyStar()) {
                    this.game.mainPlayer.updateStars(1);
                } else {
                    alert('You dont have enough coins to buy a star !');
                }
                break;
        }
        
        this.game.UI.updatePlayerScore(this.game.mainPlayer);
    }

    

}

export { Case };