// const uuid = require('uuid');

const voiceRooms = [];
let mainRoom = null;

function VoiceRoom(id) {
  this.id = id;
  this.started = Date.now();
  this.peers = [];
}

VoiceRoom.prototype.toJSON = function() {
  return {id: this.id, started: this.started, peers: this.peers};
};

VoiceRoom.prototype.addPeer = function(peer) {
  this.peers.push(peer);
};

VoiceRoom.prototype.removePeer = function(userID) {
  let i = 0, found = false;
  while(!found && i < this.peers.length) {
    if (this.peers[i].userID === userID) found = true;
    else i++;
  }
  if (found) this.peers.splice(i, 1);
};

VoiceRoom.create = function(id) {
  const voiceRoom = new VoiceRoom(id);
  mainRoom = voiceRoom;
  voiceRooms.push(voiceRoom);
  return voiceRoom;
};

VoiceRoom.get = function(id) {
  return (voiceRooms.filter(function(voiceRoom) {
    return id === voiceRoom.id;
  }) || [])[0];
};

VoiceRoom.getAll = function() {
  return voiceRooms;
};

VoiceRoom.getMainRoom = function () {
  return mainRoom;
}

module.exports = VoiceRoom;