const Twilio = require('twilio');

const config = require('./config');

var events = require('events');
//const nameGenerator = require('../name_generator');

// Access Token used for Video, IP Messaging, and Sync
const AccessToken = Twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const VideoGrant = AccessToken.VideoGrant;
const SyncGrant = AccessToken.SyncGrant;
const ConversationsGrant = AccessToken.ConversationsGrant;

/**
 * Generate an Access Token for an application user - it generates a random
 * username for the client requesting a token, and takes a device ID as a query
 * parameter.
 *
 * @return {Object}
 *         {Object.identity} String random indentity
 *         {Object.token} String token generated
 */

function tokenGenerator(username, roomname, endPointId) {

  const token = new AccessToken(
    config.TWILIO_ACCOUNT_SID,
    config.TWILIO_API_KEY,
    config.TWILIO_API_SECRET
  );
	
  if(!username || !roomname) {
    return {
      identity: "",
      token: ""
    };
  }

  token.identity = username;
  token.roomname = roomname;

  var client = new Twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

  const videoGrant = new VideoGrant();
  token.addGrant(videoGrant);


  if (config.TWILIO_CHAT_SERVICE_SID) {

    client.chat.services(config.TWILIO_CHAT_SERVICE_SID).update({
      friendlyName: config.TWILIO_CHAT_SERVICE_FRIENDLY_NAME
    }).then(function(response) {
      // console.log("chat update");
    }).catch(function(error) {
      console.log(error);
    });

    const chatGrant = new ChatGrant({
      serviceSid: config.TWILIO_CHAT_SERVICE_SID
    });
    token.addGrant(chatGrant);
  }

  return {
	  identity: token.identity,
	  roomname: token.roomname,
	  token: token.toJwt()
  };
	  
}

/*create random id using alphabets and numbers*/

function makeid(numChar){
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i = 0; i < numChar; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
}


module.exports = tokenGenerator;
