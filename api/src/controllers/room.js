const Room = require('../models/room');

exports.create = function(req, res) {
  if(!req.body.name) {
    res.status(400);
    res.json({message: 'Bad Request'});
  } else {
    Room.create({name: req.body.name}, function(error) {
      if(error) {
        res.status(500);
        res.json({message: 'Error on create'});
      } else {
        res.status(201);
        res.json({message: 'New room created'})
      }
    });
  }
};

exports.get = function (req, res) {
  const id = req.params.id;
  Room.findById(id, function(error, data) {
    if(error) {
      res.status(404).json({message: 'Room not found'});
    }
    res.status(200);
    res.json(data);
  });
}