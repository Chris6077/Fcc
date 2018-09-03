var express = require('express');
var app = express();
var bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: true
}));
var cors = require('cors');
app.use(cors());
var bcrypt = require('bcrypt');
var saltRounds = config.SR;
app.use(express.static('public'));
var mongoose = require('mongoose');
var config = require('./config');
var User = require('./models/user');
var Workout = require('./models/workout');
app.options('*', cors()) // include before other routes
mongoose.connect(config.db.host);

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/user/new', function(req,res){
  var nu = req.body;
  if(!nu.username) res.status(406).json({'error': 'Required fields missing'});
  else{
    if(typeof nu.password !== "undefined" && nu.password != null && nu.password != ""){
      bcrypt.hash(nu.password, saltRounds).then(function(hashed){
        createUser(nu, hashed.toString("base64"), res);
      }, function(err){
        res.status(500).json({'error': 'Error hashing password'});
      });
    }
    else
    {
      createUser(nu, undefined, res);
    }
  }
});

function createUser(nu, hp, res){
  User.findOne({username: nu.username.toLowerCase()}, function(err, usr){
    if(usr){
      res.status(406).json({'error': 'Username taken'});
    } else {
      var newUser = User({
        username: nu.username.toLowerCase(),
        password: hp
      });
      newUser.save(function(err){
        if(err) res.status(500).json({'error': 'Error creating user'});
        else res.status(201).json({'message': 'Successfully signed up'});
      });
    }
  });
}

app.post('/user/workouts', function(req,res){
  var obj = req.body;
  if(!obj.username) res.status(406).json({'error': 'Required fields missing'});
  else{
    User.findOne({username: obj.username.toLowerCase()}, function(err, usr){
      if(usr){
        if(usr.password){
          bcrypt.compare(obj.password, usr.password).then(function(result) {
              if(result) getWO(obj, res);
              else res.status(406).json({'error': 'Invalid username or password'})
          });
        } else getWO(obj, res);
      } else res.status(406).json({'error': 'Invalid username or password'});
    });
  }
});

function getWO(obj, res){
  var from = new Date(obj.from);
  var to = new Date(obj.to);
  Workout.find({
    username: obj.username,
    date: {
      $lt: to != 'Invalid Date' ? to.getTime() : new Date(8640000000000000),
      $gt: from != 'Invalid Date' ? new Date(from.getFullYear(),from.getMonth() , from.getDate()-1) : 0
    }
  }, {
    __v: 0,
    _id: 0
  }).sort('-date').limit(parseInt(obj.limit)).exec(function(err, result){
    if(err) res.status(500).json({'error': 'Error getting workouts'});
    else res.status(200).json(result);
  });
}

app.post('/user/login', function(req,res){
  var usr = req.body;
  if(!usr.username) res.status(406).json({'error': 'Required fields missing'});
  else{
    User.findOne({username: usr.username.toLowerCase()}, function(err, usr){
      if(usr){
        if(usr.password){
          bcrypt.compare(usr.password, usr.password).then(function(result) {
            if(result) res.status(200).json({'message': 'Logged in'});
            else res.status(406).json({'error': 'Invalid username or password'})
          });
        } else res.status(200).json({'message': 'Logged in'});
      } else res.status(406).json({'error': 'Invalid username or password'});
    });
  }
});

app.post('/workout/new', function(req,res){
  var obj = req.body;
  if(!obj.username || !obj.duration) res.status(406).json({'error': 'Required fields missing'});
  else{
    User.findOne({username: obj.username.toLowerCase()}, function(err, usr){
      if(usr){
        if(usr.password){
          bcrypt.compare(obj.password, usr.password).then(function(result) {
            if(result) insertWO(obj, res);
            else res.status(406).json({'error': 'Invalid username or password'})
          });
        } else insertWO(obj, res);
      } else res.status(406).json({'error': 'Invalid username or password'});
    });
  }
});

function insertWO(obj, res){
  var newWO = Workout({
    description: obj.description,
    duration: obj.duration,
    date: obj.date,
    username: obj.username
  });
  newWO.save(function(err){
    if(err) res.status(500).json({'error': 'Error adding workout'});
    else res.status(201).json({'message': 'Successfully added workout'});
  });
}

var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
