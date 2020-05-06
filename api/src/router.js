const Router = require('express').Router;

const tokenGenerator = require('./token_generator');
const router = new Router();
const cookie = require('cookie');
const config = require('./config');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/user.model');

// login facebook
passport.use(new FacebookStrategy({
    clientID: config.FB_APP_ID,
    clientSecret: config.FB_APP_SECRET,
    callbackURL: config.FB_CALLBACK_URL
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOrCreate({facebookId: profile.id}, (err, user) => {
      console.log(user);
      return done(err, user);
    });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


router.get('/login/facebook', 
    passport.authenticate('facebook'));

router.get('/login/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: config.APP_URL}),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect(config.APP_URL);
    }
);





// Import contact controller
const userController = require('./controllers/user.controller.js');
// User routes
router.route('/users')
    .get(userController.index)
    .post(userController.new);
router.route('/users/:user_id')
    .get(userController.view)
    .patch(userController.update)
    .put(userController.update)
    .delete(userController.delete);




router.get('/token', (req, res) => {

  var username = '';
  var roomname = '';
  var endPointId = '';

  if(req.headers.cookie){
      username = cookie.parse(req.headers.cookie).username;
  }

  if(req.headers.cookie){
      roomname = cookie.parse(req.headers.cookie).roomname;
  }
  
  if(req.query.username) {
	  username = req.query.username;
  }
  if(req.query.roomname) {
	  roomname = req.query.roomname;
  }
  if(req.query.endpointId){
      endPointId=req.query.endpointId;
  }
	
  console.log('Get token for ' + username + ', ' + roomname)
  res.send(tokenGenerator(username, roomname, endPointId));
});



module.exports = router;
