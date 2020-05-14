class Case {

    constructor(game, type, position) {
        this.game = game;
        this.type = type;
        this.position = position;
        this.mesh = null;
        this.value = (this.type === 'blue') ? 6 : -6;
    }

}

export { Case };