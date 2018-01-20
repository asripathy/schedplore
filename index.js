var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.get('/', function(req, res) {
  console.log('home');
  res.send('naga');
});

app.listen(port, function() {
  console.log('listening on: ' + port);
});
