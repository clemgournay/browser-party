import { Board } from './Board.js';
import { Player } from './Player.js';
import { MainPlayer } from './MainPlayer.js'; 
import { Voice } from './Voice.js'; 
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
        
        this.sync = new Sync(this);
        /*this.voice = new Voice(this);*/
        this.chat = new Chat(this);
        
        this.players = {};
    }

    init() {
        this.board.controls.setAction(this.mainPlayer.stopDice, this.mainPlayer);
        this.board.load(() => {
            this.UI.init();
            this.board.build();
            this.update();
            this.start();
            this.sync.connect(this.mainPlayer, (players) => {
                console.log(players)
                this.setPlayers(players);
                this.chat.connect();
            })
        });
        
        /*this.voice.connect(this.mainPlayer.name, this.boardname);*/

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
        console.log(this.characters)
        const index = Math.floor(Math.random() + Object.keys(this.characters).length - 1);
        return Object.keys(this.characters)[index]; 
    }

    setPlayers(players) {
        for (var id in players) {
            const player = players[id];
            if (id !== this.mainPlayer.id) {
                this.newPlayer(id, player);
            }
        } 
    }

    newPlayer(id, player) {
        console.log(player)
        this.players[id] = new Player(this, player.name);
        this.players[id].id = id;
        this.players[id].position = player.position;
        this.players[id].characterID = player.characterID;
        //this.board.newCharacter(this.players[id]);
    }

    movePlayer(id, position) {
        this.players[id].position = position;
        this.board.moveCharacter(id, position);
    }

    removePlayer(id) {
        this.board.removeCharacter(id);
        delete this.players[id];
    }

    updatePosition(position) {
        this.mainPlayer.position = position;
        this.sync.updatePosition(position);
    }

    updateRotation(rotation) {
        this.mainPlayer.rotation = rotation;
        this.sync.updateRotation(rotation);
    }


}

export { Game };