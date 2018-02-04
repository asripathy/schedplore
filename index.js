var https = require('https')
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var google_key = 'AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I';

app.get('/', function(req, res) {
  console.log('home');
  getGooglePlaces(res);
});

app.listen(port, function() {
  console.log('listening on: ' + port);
});

function getGooglePlaces(res) {
  https.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I&location=37.870921,-122.259079&radius=500', function(resp) {
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