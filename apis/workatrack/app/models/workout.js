var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var workoutSchema = new Schema({
  description: String,
  duration: Number,
  date: Date,
  username: String,
  createdAt: Date
});

workoutSchema.pre('save', function(next){
  var nw = this;
  if(!nw.date || nw.date == null) nw.date = new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate());
  nw.createdAt = new Date();
  next();
});


var Workout = mongoose.model('WorkATrackWorkout', workoutSchema);
module.exports = Workout;