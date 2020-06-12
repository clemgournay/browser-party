

const uuid = require('uuid');
const voiceRoom = require('./voice-room');
const roomID = '5ebb583382f6851c9c391d59';

module.exports = function (server) {

    const io = require('socket.io')(server);

    this.players = {};
    this.messages = [];
    this.playerCount = 0;
    this.playerIndex = 0;
    this.currentPlayerID = null;

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
        while (!found && i < Object.keys(this.players[roomID]).length) {
            id = Object.keys(this.players[roomID])[i];
            if (this.players[roomID][id].controlID === controlID) found = true;
            else i++;
        }
        return (found) ? this.players[roomID][id] : null;
    }

    io.on('connection', (socket) => {
    
        const data = socket.request;

        if (!this.players[roomID]) this.players[roomID] = {};

        if (Object.keys(this.players[roomID]).length === 4) {
            socket.emit('room full');
        } else {
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
                const controlID = uuid.v1();

                this.players[roomID][id] = {
                    socketID: socket.id,
                    name: name,
                    position: {block: parseFloat(position[0]), way: parseFloat(position[1]), case: parseFloat(position[2])},
                    controlID: controlID,
                    order: this.playerCount
                };
                if (this.playerCount === 0) this.currentPlayerID = id;

                this.playerCount++;

                console.log(name + '(' + socket.id + ') joined the room ' + roomID);
                socket.emit('players', {players: this.players[roomID], currentPlayerID: this.currentPlayerID});
                socket.emit('controlID', controlID);

                socket.broadcast.to(roomID).emit('player logged in', {id: id, player: this.players[roomID][id]});

                socket.emit('chat messages', this.messages);

                socket.on('player selection', (data) => {
                    socket.broadcast.to(roomID).emit('player selection made', {id: id, selection: data.selection, params: data.params});
                });

                socket.on('way chose', (way) => {
                    socket.broadcast.to(roomID).emit('way chosen', {id: id, way: way});
                });

                socket.on('hit dice', (score) => {
                    socket.broadcast.to(roomID).emit('dice hit', {id: id, score: score});
                });

                socket.on('player turn over', () => {
                    this.playerIndex++;
                    if (this.playerIndex > Object.keys(this.players[roomID]).length - 1) this.playerIndex = 0;
                    this.currentPlayerID = Object.keys(this.players[roomID])[this.playerIndex];
                    io.to(roomID).emit('next player turn', this.currentPlayerID);
                });

                socket.on('chat send', (msg) => {
                    const message = {
                        id: uuid.v1(),
                        tempID: msg.tempID,
                        author: {id: id, name: this.players[roomID][id].name},
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
                    delete this.players[roomID][id];
                    //const mainVoiceRoom = voiceRoom.getMainRoom();
                    //mainVoiceRoom.removePeer(id);
                    socket.leave(roomID);
                    this.playerCount--;
                    console.log(name +  '(' + socket.id + ') disconnected from room ' + roomID);
                    socket.broadcast.to(roomID).emit('player left', id);
                    console.log('USER LIST', this.players[roomID]);
                });    
            }
        }

    });

}