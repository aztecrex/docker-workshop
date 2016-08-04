'use strict';

const express = require('express');
const redis = require('redis');
// Constants
const PORT = 8080;

// collaborators
var client = redis.createClient('6379', 'r0.dat');

// App
const app = express();
app.get('/', function (req, res) {
  client.get('counter', function(err, counter) {
    if(err) return next(err);
    res.json({'count': counter || 0})
    // res.send('count: ' + counter);
  });
});

app.post('/', function (req, res) {
  client.incr('counter', function(err, counter) {
    if(err) return next(err);
    res.json({'count': counter || 0})
    // res.send('count: ' + counter);
  });
});

app.listen(PORT);
console.log('Running on port ' + PORT);
