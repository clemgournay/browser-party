const mongoose = require('mongoose');

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const messageSchema = mongoose.Schema({
  authorID: {
    type: ObjectId
  },
  roomID: {
    type: String // should change to type: ObjectId
  },
  date: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String
  }
});

module.exports = mongoose.model('Message', messageSchema, 'messages');
