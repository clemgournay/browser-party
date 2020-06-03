import { Board } from './Board.js';
import { Player } from './Player.js';
import { MainPlayer } from './MainPlayer.js'; 
import { MessageSystem } from './MessageSystem.js';
import { Sync } from './Sync.js';
import { Chat } from './Chat.js';
import { UI } from './UI.js';


class Game {

    constructor () {
        this.characters = {
            'char1': null,
            'char2': null
        };
        this.board = new Board(this);
        this.mainPlayer = new MainPlayer(this);
        this.UI = new UI(this);
        this.diceRolling = false;
        this.messageSystem = new MessageSystem(this);
        
        this.sync = new Sync(this);
        this.chat = new Chat(this);
        
        this.players = {};
        this.playerOrder = [];
        this.playerTurn = 0;
        this.currentPlayer = null;
    }

    init() {
        this.board.load(() => {
            this.UI.init();
            this.sync.connect(this.mainPlayer, (players) => {
                this.setPlayers(players);
                this.board.build();
                this.update();
                this.start();
                this.chat.connect();
            });
        });
    }

    update() {
        this.board.update();
        window.requestAnimationFrame(() => {
            this.update();
        });
    }

    start() {
        this.board.showDice();
    }

    getRandomCharacter() {
        const index = Math.floor(Math.random() + Object.keys(this.characters).length - 1);
        return Object.keys(this.characters)[index]; 
    }

    setPlayers(playerData) {
        this.playerOrder = playerData.order;
        //console.log('[PLAYERS SERVER]', players);
        for (let id in playerData.players) {
            const player = playerData.players[id];
            if (id !== this.mainPlayer.id) {
                this.newPlayer(id, player);
            } else {
                console.log(this.mainPlayer, id)
                this.players[id] = this.mainPlayer;
            }
        }
        console.log(this.playerOrder)
        const currPlayerID = this.playerOrder[this.playerTurn];
        this.players[currPlayerID].myTurn = true;
        this.currentPlayer = this.players[currPlayerID];
        console.log('[PLAYERS]', this.players);
        console.log('[CURRENT PLAYER]', this.currentPlayer);
    }

    newPlayer(id, player) {
        this.players[id] = new Player(this, player.name);
        this.players[id].id = id;
        this.players[id].position = player.position;
        this.players[id].characterID = player.characterID;
        this.board.newCharacter(this.players[id]);
    }

    movePlayer(id, position) {
        this.board.moveCharacter(id, position);
    }

    removePlayer(id) {
        this.board.removeCharacter(id);
        delete this.players[id];
    }

    mainPlayerHitDice(score) {
        this.sync.mainPlayerHitDice(score);
    }


}

export { Game };