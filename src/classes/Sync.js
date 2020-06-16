import { API_URL } from '../environment.js';

class Sync {

    constructor(game) {
    
        this.game = game;
        this.playerID = null;
        this.playername = null;
        this.position = null;
        this.controlID = null;
        this.socket = null;
    }

    connect(player, callback) {

        this.playerID = player.id;
        this.playername = player.name;
        this.position = player.position;
        this.characterID = player.characterID;

        this.socket = io.connect(API_URL, {
            query: 'id=' + this.playerID + '&name=' + this.playername + '&position=' + this.position.block + ',' + this.position.way + ',' + this.position.case + '&rotation=' + this.rotation + '&characterID=' + this.characterID 
        });

        this.socket.on('players', (playerData) => {
            callback(playerData);
        });

        this.socket.on('room full', () => {
            alert('This game is full');
        });

        this.socket.on('controlID', (controlID) => {
            this.controlID = controlID;
            this.game.UI.showQRCode();
            console.log('[CONTROLLER ID] ', this.controlID);
        });

        this.socket.on('control sent', (controlData) => {
            if (controlData.id === this.controlID) {
                console.log('Control received', controlData)
                if (controlData.control === 'joystick') {
                    this.game.board.controls.moveJoystick(controlData);
                } else {
                    this.game.board.controls.callAction(controlData.control);
                }
            }
        });

        this.socket.on('player logged in', (e) => {
            console.log('player logged in: ' + e.id)
            this.game.newPlayer(e.id, e.player);
            this.game.playerOrder = e.order;
        });

        this.socket.on('dice hit', (e) => {
            this.game.board.playerDiceHit(e.id, e.score);
        });

        this.socket.on('way chosen', (e) => {
            this.game.board.playerWayChosen(e.id, e.way);
        });
        
        this.socket.on('next player turn', (nextPlayerID) => {
            this.game.nextPlayerTurn(nextPlayerID);
        });

        this.socket.on('player selection made', (e) => {
            console.log('[SYNC] Player ' + e.id + ' made selection ' + e.selection + ' with params', e.params);
            this.game.playerSelect(e.id, e.selection, e.params);
        });

        this.socket.on('player left', (e) => {
            console.log('player left: ' + e.id);
            this.game.removePlayer(e.id);
            this.game.playerOrder = e.order;
        });
        
    }

    mainPlayerHitDice(score) {
        if (this.socket) this.socket.emit('hit dice', score);
    }
    
    mainPlayerWayChose(way) {
        if (this.socket) this.socket.emit('way chose', way);
    }

    mainPlayerTurnOver() {
        if (this.socket) this.socket.emit('player turn over');
    }

    mainPlayerSelection(selection, params) {
        console.log('[SYNC] SEND USER SELECTION', selection, params)
        if (this.socket) this.socket.emit('player selection', {selection: selection, params: params});
    }

}

export { Sync };