class Case {

    constructor(game, type, position) {
        this.game = game;
        this.type = type;
        this.position = position;
        this.mesh = null;
    }

    action () {
        switch(this.type) {
            case 'blue':
                this.game.mainPlayer.coins += this.game.board.blueCaseValue;
                break;
            case 'red':
                this.game.mainPlayer.coins += this.game.board.redCaseValue;
                break;
        }
        if (this.game.mainPlayer.coins < 0) {
            this.game.mainPlayer.coins = 0;
        } else if (this.game.mainPlayer.coins >= 100) {
            
        }
        this.game.UI.updatePlayerScore(this.game.mainPlayer);
    }

}

export { Case };