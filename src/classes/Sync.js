import { API_URL } from '../environment.js';

class Sync {

    constructor(game) {
    
        this.game = game;
        this.playerID = null;
        this.playername = null;
        this.position = null;
        this.characterID = null;
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

        this.socket.on('players', (players) => {
            callback(players);
        });

        this.socket.on('controlID', (controlID) => {
            this.controlID = controlID;
            this.game.UI.showQRCode();
            console.log('[CONTROLLER ID] ', this.controlID);
        });

        this.socket.on('control sent', (controlData) => {
            if (controlData.id === this.controlID) {
                console.log('Control received', controlData)
                if (controlData.control === 'action') {
                    this.game.board.controls.callAction();
                }
            }
        })

        this.socket.on('player logged in', (e) => {
            console.log('player logged in: ' + e.id)
            this.game.newPlayer(e.id, e.player);
        });

        this.socket.on('player moved', (e) => {
            this.game.movePlayer(e.id, e.position);
        });

        this.socket.on('player left', (id) => {
            console.log('player left: ' + id);
            this.game.removePlayer(id);
        });
        
    }

    updateMainPlayerPosition(position) {
        if (this.socket) this.socket.emit('position update', this.game.mainPlayer.position);
    }

}

export { Sync };