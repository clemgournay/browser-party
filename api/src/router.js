const Router = require('express').Router;

const router = new Router();
const config = require('./config');
//const User = require('./models/user');


// Import contact controller
/*const userController = require('./controllers/user');
// User routes
router.route('/users')
    .get(userController.index)
    .post(userController.new);
router.route('/users/:user_id')
    .get(userController.view)
    .patch(userController.update)
    .put(userController.update)
    .delete(userController.delete);*/

/* 
/* VOICE ROOM ENDPOINT 
*/
const VoiceRoom = require('./voice-room');
let roomID = '5ebb583382f6851c9c391d59';
// Create VoiceRoom or Get if exists
router.get('/voice', function(req, res) {
  let voiceRoom;
  
  const mainVoiceRoom = VoiceRoom.getMainRoom();
  if (mainVoiceRoom === null) {
    voiceRoom = VoiceRoom.create(roomID);
  } else {
    voiceRoom = mainVoiceRoom;
  }
  res.json(voiceRoom.toJSON());
});

// Create a new VoiceRoom instance, and redirect
router.get('/voice/new', function(req, res) {
  const voiceRoom = VoiceRoom.create(roomID);
  res.json(voiceRoom.toJSON());
});

// Add PeerJS ID to VoiceRoom instance when someone opens the page
router.post('/voice/:id/addpeer/:peerid', function(req, res) {
  const voiceRoom = VoiceRoom.get(req.params.id);
  const userID = req.body.userID;
  if (!voiceRoom) return res.status(404).send('VoiceRoom not found');
  voiceRoom.addPeer({peerID: req.params.peerid, userID: userID});
  res.json(voiceRoom.toJSON());
});

// Remove PeerJS VoiceRoom when someone leaves the page
/*router.post('/voice/:id/removepeer/:peerid', function(req, res) {
  const voiceRoom = VoiceRoom.get(req.params.id);
  if (!voiceRoom) return res.status(404).send('VoiceRoom not found');
  voiceRoom.removePeer(req.params.peerid);
  res.json(voiceRoom.toJSON());
});*/

// Get VoiceRoom as JSON
router.get('/voice/:id', function(req, res) {
  const voiceRoom = VoiceRoom.get(req.params.id);
  if (!voiceRoom) return res.redirect('/new');
  res.json(voiceRoom.toJSON());
});



module.exports = router;
