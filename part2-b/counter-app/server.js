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
  for (var i=0; i<queue.length; ++i) {
    respond(queue[i],message);
  }
  queue.length = 0;
});

sclient.subscribe('counter');

var respond = function(res,count) {
  res.json({'count': count || 0})
}

// App
const app = express();
app.use(bodyParser.json());

app.get('/', function (req, res, next) {
  client.get('counter', function(err, curval) {
    if(err) return next(err);
    var counter = curval || 0;
    var have = req.query.have || 0;
    if (have >= counter) {
      queue.push(res);
    } else {
      respond(res,counter);
    }
  });
});

app.post('/', function (req, res, next) {
  var by = req.body.add || 1;
  client.incrby('counter', by, function(err, counter) {
    if(err) return next(err);
    client.publish('counter',counter);
    respond(res,counter);
  });
});

app.listen(PORT);
console.log('Running on port ' + PORT);
