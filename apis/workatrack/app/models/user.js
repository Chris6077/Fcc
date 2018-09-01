var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: String,
  createdAt: Date
});

userSchema.pre('save', function(next){
  var nu = this;
  nu.createdAt = new Date();
  next();
});

var User = mongoose.model('WorkATrackUser', userSchema);
module.exports = User;