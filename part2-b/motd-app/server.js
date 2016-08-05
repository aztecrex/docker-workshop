'use strict';

const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');

// Constants
const PORT = 8080;

// collaborators
var client = redis.createClient('6379', 'store');
var sclient = redis.createClient('6379', 'store'); // subscription only

// awaiting service
var queue = [];

sclient.on('message', function(channel,message){
  fetch(function(err, curval) {
    if (err) return;
    var jent = JSON.stringify(curval);
    for (var i=0; i<queue.length; ++i) {
      queue[i].setHeader('Content-Type', 'application/json');
      queue[i].send(jent);
    }
    queue.length = 0;
  });
});
sclient.subscribe('motd');

var entity = function(serial, message) {
  return {"serial":serial, "message":message};
}

var fetch = function(cb) {
  client.multi()
    .get('serial')
    .get('message')
    .exec(function(err, replies){
      if (err) return cb(err);
      var serial = replies[0] || 0;
      var message = replies[1] || "";
      return cb(null, entity(serial, message));
    });
}

// App
const app = express();
app.use(bodyParser.json());

app.get('/', function (req, res, next) {
  fetch(function(err, curval){
    if(err) return next(err);
    var have = req.query.have || 0;
    if ( have >= curval.serial) {
      queue.push(res);
    } else {
      res.json(curval);
    }
  });
});

app.put('/', function (req, res, next) {
  client.multi()
    .set('message', req.body.message)
    .incr('serial')
    .publish('motd',"update")
    .exec(function(err, replies){
      if(err) return next(err);
      if (err) return cb(err);
      var serial = replies[1] || 0;
      res.json(entity(serial, req.body.message));
    });
});

app.listen(PORT);
console.log('Running on port ' + PORT);
