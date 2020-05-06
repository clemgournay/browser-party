import { API_URL } from '../environment.js';

class Sync {

    constructor(game) {
        this.game = game;
        this.userID = null;
        this.username = null;
        this.position = null;
        this.avatar = null;
        this.socket = null;
    }

    connect(user, callback) {

        this.userID = user.id;
        this.username = user.name;
        this.position = user.initPos;
        this.avatar = user.avatar;

        this.socket = io.connect(API_URL, {
            query: 'id=' + this.userID + '&name=' + this.username + '&position=' + this.position.x + ',' + this.position.y + ',' + this.position.z
        });

        this.socket.on('users', (users) => {
            callback(users);
        });

        this.socket.on('user logged in', (e) => {
            console.log('User logged in: ' + e.id)
            this.game.newUser(e.id, e.user);
        });

        this.socket.on('user moved', (e) => {
            this.game.moveUser(e.id, e.position);
        });

        this.socket.on('user left', (id) => {
            console.log('user left: ' + id);
            this.game.removeUser(id);
        });
        
    }

    updatePosition(position) {
        if (this.socket) this.socket.emit('position update', {x: position.x, y: position.y, z: position.z});
    }

}

export { Sync };