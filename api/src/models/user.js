const mongoose = require('mongoose');
// Setup schema
const userSchema = mongoose.Schema({
    socialId: {
        type: String
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    avatar: {
      type: String
    },
    create_date: {
        type: Date,
        default: Date.now
    }
});

userSchema.statics.findOrCreate = function findOrCreate(condition, data, callback) {
    const self = this
    self.findOne(condition, (err, result) => {
        return result ? callback(err, result) : self.create(data, (err, result) => { return callback(err, result) })
    });
}
// Export Contact model
const User = module.exports = mongoose.model('user', userSchema);
module.exports.get = function (callback, limit) {
    User.find(callback).limit(limit);
}