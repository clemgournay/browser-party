const User = require('../models/user');
exports.login = function (req, res) {
  res.json(req.user);
  // res.json({
  //   _id: "5eba7164ec8c3522205a5330",
  //   socialId: "137757307864338",
  //   name: "Nguyễn Tỉnh",
  //   email: "nguyentinhdev@gmail.com",
  //   avatar: "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=137757307864338&height=50&width=50&ext=1591869030&hash=AeQgLAK20nn6STEq",
  //   create_date: "2020-05-12T09:50:28.361Z",
  //   __v: 0
  // })
};

exports.saveUser = (accessToken, refreshToken, profile, done) => {
  console.log(profile);
  let name = profile.displayName ? profile.displayName : '';
  let email = profile.emails ? profile.emails[0].value : '';
  let avatar = profile.photos ? profile.photos[0].value : '';
  if (avatar == '') {
    avatar = profile.pictureUrl ? profile.pictureUrl : '';
  }
  User.findOrCreate({ socialId: profile.id }, { socialId: profile.id, name: name, email: email, avatar: avatar }, (err, user) => {
    return done(err, user);
  });
}

