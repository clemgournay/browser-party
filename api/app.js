require('dotenv').load();

// Node/Express
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./src/config');
const passport = require('passport');

// Import Mongoose
let mongoose = require('mongoose');

// Create Express webapp
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Add body parser for Notify device registration
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', config.APP_URL);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});


mongoose.connect('mongodb+srv://fct970:fct970FastGear@cluster0-bkfz6.mongodb.net/fastVR?retryWrites=true&w=majority', {useNewUrlParser: true});
const db = mongoose.connection;

// Added check for DB connection
if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")

const router = require('./src/router');
app.use(router);


// Create http server and run it
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

const users = {};
const messages = [];

io.on('connection', (socket) => {
  
  const data = socket.request;
  const id = data._query.id;
  const name = data._query.name;
  const position = data._query.position.split(',');
  const avatar = data._query.avatar;

  users[id] = {
    name: name,
    position: {x: parseFloat(position[0]), y: parseFloat(position[1]), z: parseFloat(position[2])},
    avatar: avatar
  };
  
  console.log(name + ' connected');

  socket.emit('users', users);
  socket.broadcast.emit('user logged in', {id: id, user: users[id]});

  socket.emit('chat messages', messages);

  socket.on('position update', (position) => {
    users[id].position = position;
    socket.broadcast.emit('user moved', {id: id, position: position});
  });

  socket.on('rotation update', (rotation) => {
    users[id].rotation = rotation;
    socket.broadcast.emit('user rotated', {id: id, rotation: rotation});
  });

  socket.on('avatar update', (avatar) => {
    users[id].avatar = avatar;
    socket.broadcast.emit('avatar updated', {id: id, avatar: avatar});
  });

  socket.on('chat send', (msg) => {
    const message = {
      id: uniqueID(),
      tempID: msg.tempID,
      author: {id: id, name: users[id].name},
      date: new Date(),
      content: msg.content
    };
    messages.push(message);
    io.sockets.emit('chat sent', message);
  })

  socket.on('disconnect', () => {
    delete users[id];
    console.log(name +  'disconnected');
    socket.broadcast.emit('user left', id);
  });


});

const uniqueID = function () {
  return '_' + Math.random().toString(36).substr(2, 9);
};


server.listen(port, function() {
  console.log('Express server running on *:' + port);
});


module.exports = app;