

const uuid = require('uuid');
const voiceRoom = require('./voice-room');
const roomID = '5ebb583382f6851c9c391d59';

module.exports = function (server) {

    const io = require('socket.io')(server);

    const players = {};
    const messages = [];

    io.on('connection', (socket) => {
    
        const data = socket.request;

        socket.join(roomID);

            const id = data._query.id;
            const name = data._query.name;
            const position = data._query.position.split(',');
            const rotation = data._query.rotation;
            const characterID = data._query.characterID;
            const controlID = uuid.v1();

            players[id] = {
                socketID: socket.id,
                name: name,
                position: {x: parseFloat(position[0]), y: parseFloat(position[1]), z: parseFloat(position[2])},
                rotation: rotation,
                characterID: characterID
            };

            console.log(name + '(' + socket.id + ') joined the room ' + roomID);
            console.log('PLAYER LIST', players);
            socket.emit('players', players);
            socket.emit('controlID', controlID);

            socket.broadcast.to(roomID).emit('player logged in', {id: id, player: players[id]});

            socket.emit('chat messages', messages);

            socket.on('control send', (controlData) => {
                socket.broadcast.emit('control sent', controlData);
            });

            socket.on('position update', (position) => {
                if (players[id]) {
                    players[id].position = position;
                    socket.broadcast.to(roomID).emit('player moved', {id: id, position: position});
                }
            });

            socket.on('rotation update', (rotation) => {
                if (players[id]) {
                    players[id].rotation = rotation;
                    socket.broadcast.to(roomID).emit('player rotated', {id: id, rotation: rotation});
                }
            });

            socket.on('name update', (name) => {
                if (players[id]) {
                    players[id].name = name;
                    socket.broadcast.to(roomID).emit('name updated', {id: id, name: name});
                }
            });

            socket.on('character update', (characterID) => {
                if (players[id]) {
                    players[id].characterID = characterID;
                    socket.broadcast.to(roomID).emit('character updated', {id: id, characterID: characterID});
                }
            });

            socket.on('chat send', (msg) => {
                const message = {
                    id: uuid.v1(),
                    tempID: msg.tempID,
                    author: {id: id, name: players[id].name},
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
                messages.push(message);
                io.to(roomID).emit('chat sent', message);
            });

            socket.on('disconnect', () => {
                delete players[id];
                //const mainVoiceRoom = voiceRoom.getMainRoom();
                //mainVoiceRoom.removePeer(id);
                socket.leave(roomID);
                console.log(name +  '(' + socket.id + ') disconnected from room ' + roomID);
                socket.broadcast.to(roomID).emit('player left', id);
                console.log('USER LIST', players);
            });    

    });

}