require('dotenv').load();

// Node/Express
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./src/config');
//const passport = require('passport');

// Import Mongoose
//let mongoose = require('mongoose');

// Create Express webapp
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Add body parser for Notify device registration
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
//app.use(passport.initialize());
//app.use(passport.session());

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', config.APP_URL);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});


/*mongoose.connect('mongodb+srv://fct970:fct970FastGear@cluster0-bkfz6.mongodb.net/fastVR?retryWrites=true&w=majority', {useNewUrlParser: true});
const db = mongoose.connection;

// Added check for DB connection
if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")*/

const router = require('./src/router');
app.use(router);


// Create http server and run it
const server = http.createServer(app);
const port = process.env.PORT || 3000;

require('./src/socket')(server);


server.listen(port, function() {
  console.log('Express server running on *:' + port);
});


module.exports = app;