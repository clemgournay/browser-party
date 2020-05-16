const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
  name: {
    type: String
  }
});

module.exports = mongoose.model('Room', roomSchema, 'rooms');
