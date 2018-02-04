var https = require('https')
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var google_key = 'AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I';

app.get('/', function(req, res) {
  console.log('home');
  getGooglePlaces(res, '37.870921,-122.259079', 'restaurant');
});

app.listen(port, function() {
  console.log('listening on: ' + port);
});

function getGooglePlaces(res, place, type) {
  var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I&location=' + place + '&radius=500&type=' + type
  https.get(url, function(resp) {
    var data = '';
    
    // A chunk of data has been recieved.
    resp.on('data', function(chunk) {
      data += chunk;
    });
    
    // The whole response has been received. Print out the result.
    resp.on('end', function() {
      res.send(JSON.parse(data));
    });
    
    }).on("error", function(err) {
      console.log("Error: " + err.message);
    });
}