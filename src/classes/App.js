import { Room } from './Room.js';
import { User } from './User.js';
import { MainUser } from './MainUser.js'; 
import { Voice } from './Voice.js'; 
import { Sync } from './Sync.js';
import { Chat } from './Chat.js';
import { UI } from './UI.js';

class App {

    constructor () {
        this.roomname = 'fastVR';
        this.mainUser = new MainUser(this.username);
        this.room = new Room(this);
        this.sync = new Sync(this);
        this.voice = new Voice(this);
        this.chat = new Chat(this);
        this.UI = new UI(this);
        this.users = {};
    }

    init() {
        this.room.build();
        this.update();
        this.UI.init();
        /*this.voice.connect(this.mainUser.name, this.roomname);
        this.sync.connect(this.mainUser, (users) => {
            this.setUsers(users);
            this.chat.connect();
        });*/
    }

    update() {
        this.room.update();
        window.requestAnimationFrame(() => {
            this.update();
        });
    }

    setUsers(users) {
        for (var id in users) {
            const user = users[id];
            if (id !== this.mainUser.id) {
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
        this.mainUser.position = position;
        this.sync.updatePosition(position);
    }

    updateRotation(rotation) {
        this.mainUser.rotation = rotation;
        this.sync.updateRotation(rotation);
    }

    updateAvatar(URL) {
        this.mainUser.updateAvatar(URL);
        this.sync.updateAvatar(URL);
    }


}

export { App };