const User = require('../models/user');

// Handle index actions
exports.index = function (req, res) {
  User.get(function (err, users) {
      if (err) {
          res.json({
              status: "error",
              message: err,
          });
      }
      res.json({
          status: "success",
          message: "users retrieved successfully",
          data: users
      });
  });
};

// Handle create user actions
exports.new = function (req, res) {
  var user = new User();
  user.name = req.body.name ? req.body.name : user.name;
  user.email = req.body.email;
  user.avatar = req.body.avatar;
// save the user and check for errors
  user.save(function (err) {
    if (err) {
      res.json(err);
    } else {
      res.json({
        message: 'New user created!',
        data: user
      });
    }
  });
};

// Handle view user info
exports.view = function (req, res) {
  User.findById(req.params.user_id, function (err, user) {
      if (err) {
          res.send(err);
      }
      else {
        res.json({
            message: 'User details loading..',
            data: user
        });
      }
  });
};

// Handle update user info
exports.update = function (req, res) {
  User.findById(req.params.user_id, function (err, user) {
    if (err) {
      res.send(err);
    }
    user.name = req.body.name ? req.body.name : user.name;
    user.email = req.body.email ? req.body.email : user.email;
    user.avatar = req.body.avatar ? req.body.avatar : user.avatar;
    // save the user and check for errors
    user.save(function (err) {
      if (err) {
          res.json(err);
      } else {
        res.json({
            message: 'user Info updated',
            data: user
        });
      }
    });
  });
};

// Handle delete user
exports.delete = function (req, res) {
  User.remove({
    _id: req.params.user_id
  }, function (err, user) {
    if (err) {
        res.send(err);
    } else {
      res.json({
        status: "success",
        message: 'user deleted'
      });
    }
  });
};