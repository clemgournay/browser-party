import { Board } from './Board.js';
import { Player } from './Player.js';
import { MainPlayer } from './MainPlayer.js'; 
import { Voice } from './Voice.js'; 
import { Sync } from './Sync.js';
import { Chat } from './Chat.js';
import { UI } from './UI.js';

class Game {

    constructor () {
        this.board = new Board(this);
        this.mainPlayer = new MainPlayer(this);
        this.UI = new UI(this);
        this.diceRolling = false;
        /*this.sync = new Sync(this);
        this.voice = new Voice(this);
        this.chat = new Chat(this);
        
        this.players = {};*/
    }

    init() {
        this.board.load(() => {
            this.UI.init();
            this.board.build();
            this.update();
            this.start();
        });
        
        /*this.UI.init();
        this.voice.connect(this.mainPlayer.name, this.roomname);
        this.sync.connect(this.mainPlayer, (users) => {
            this.setUsers(users);
            this.chat.connect();
        });*/
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

    /*setUsers(users) {
        for (var id in users) {
            const user = users[id];
            if (id !== this.mainPlayer.id) {
                this.newUser(id, user);
            }
        } 
    }

    newUser(id, user) {
        this.users[id] = new User(user.name);
        this.users[id].id = id;
        this.users[id].position = user.position;
        this.users[id].avatar = user.avatar;
        this.room.newCharacter(this.users[id]);
    }

    moveUser(id, position) {
        this.users[id].position = position;
        this.room.moveCharacter(id, position);
    }

    removeUser(id) {
        this.room.removeCharacter(id);
        delete this.users[id];
    }

    updatePosition(position) {
        this.mainPlayer.position = position;
        this.sync.updatePosition(position);
    }

    updateRotation(rotation) {
        this.mainPlayer.rotation = rotation;
        this.sync.updateRotation(rotation);
    }
*/


}

export { Game };