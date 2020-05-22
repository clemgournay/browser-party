class Case {

    constructor(game, type, position, direction) {
        this.game = game;
        this.type = type;
        this.position = position;
        this.direction = direction;
        this.mesh = null;
    }

    action (callback) {
        switch(this.type) {
            case 'blue':
                this.game.mainPlayer.updateCoins(this.game.board.blueCaseValue);
                callback();
                break;
            case 'red':
                this.game.mainPlayer.updateCoins(this.game.board.redCaseValue);
                callback();
                break;
            case 'star':
                if (this.game.mainPlayer.canBuyStars(1)) {
                    this.game.messageSystem.confirm('Toad', 'Do you want to buy a star for ' + this.game.board.starPrice + ' coins ?', () => {
                        this.game.mainPlayer.buyStars(1);
                        callback();
                    }, () => {
                        callback();
                    });
                } else {
                    this.game.messageSystem.alert('You dont have enough coins to buy a star !', () => {
                        callback();
                    });
                }
                break;
        }
        
        this.game.UI.updatePlayerScore(this.game.mainPlayer);
    }

    

}

export { Case };