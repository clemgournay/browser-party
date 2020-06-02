

const uuid = require('uuid');
const voiceRoom = require('./voice-room');
const roomID = '5ebb583382f6851c9c391d59';

module.exports = function (server) {

    const io = require('socket.io')(server);

    this.players = {};
    this.messages = [];
    this.playerOrder = [];

    this.findInArray = (arr, key, value) => {
        let i = 0, found = false;
        while (!found && i < arr.length) {
            if (arr[i][key] === value) found = true;
            else i++;
        }
        return (found) ? i : -1;
    }

    this.findPlayerByControlID = (controlID) => {
        let i = 0, found = false;
        let id = null;
        while (!found && i < Object.keys(this.players).length) {
            id = Object.keys(this.players)[i];
            if (this.players[id].controlID === controlID) found = true;
            else i++;
        }
        return (found) ? this.players[id] : null;
    }

    io.on('connection', (socket) => {
    
        const data = socket.request;

        socket.join(roomID);

        if (data._query.controlID) {
            const controlID = data._query.controlID;
            const player = this.findPlayerByControlID(controlID);
            console.log('CONTROLLER CONNECTED: ' + controlID);
            if (player) {
                console.log('PLAYER FOUND')
                socket.on('control send', (controlData) => {
                    console.log('CONTROL SENT', controlData)
                    io.to(player.socketID).emit('control sent', controlData);
                });
            }
        } else {

            const id = data._query.id;
            const name = data._query.name;
            const position = data._query.position.split(',');
            console.log(position)
            const characterID = data._query.characterID;
            const controlID = uuid.v1();

            this.players[id] = {
                socketID: socket.id,
                name: name,
                position: {block: parseFloat(position[0]), way: parseFloat(position[1]), case: parseFloat(position[2])},
                characterID: characterID,
                controlID: controlID
            };

            this.playerOrder.push(id);

            console.log(name + '(' + socket.id + ') joined the room ' + roomID);
            socket.emit('players', {players: this.players, order: this.playerOrder});
            socket.emit('controlID', controlID);

            socket.broadcast.to(roomID).emit('player logged in', {id: id, player: this.players[id], order: this.playerOrder});

            socket.emit('chat messages', this.messages);

            socket.on('hit dice', (score) => {
                socket.broadcast.to(roomID).emit('dice hit', {id: id, score: score});
            });

            socket.on('chat send', (msg) => {
                const message = {
                    id: uuid.v1(),
                    tempID: msg.tempID,
                    author: {id: id, name: this.players[id].name},
                    date: new Date(),
                    content: msg.content
                };

                /*Message.create({
                    authorID: id,
                    roomID: '',
                    content: msg.content
                }, function(error) {
                    if(error) {
                        console.log('error on save');
                    }
                });*/

                console.log(message);
                this.messages.push(message);
                io.to(roomID).emit('chat sent', message);
            });

            socket.on('disconnect', () => {
                delete this.players[id];
                //const mainVoiceRoom = voiceRoom.getMainRoom();
                //mainVoiceRoom.removePeer(id);
                socket.leave(roomID);
                const index = this.findInArray(this.playerOrder, 'id', id);
                this.playerOrder.splice(index, 1);
                console.log(name +  '(' + socket.id + ') disconnected from room ' + roomID);
                socket.broadcast.to(roomID).emit('player left', {id: id, order: this.playerOrder});
                console.log('USER LIST', this.players);
            });    
        }

    });

}