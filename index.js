var https = require('https')
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var google_key = 'AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I';

app.get('/', function(req, res) {
  console.log('home');
  getPlaces(res, '37.870921,-122.259079', 500, 'restaurant');
  getLatLng('San Francisco');
});

app.listen(port, function() {
  console.log('listening on: ' + port);
});

// converts city to lat,lng string
function getLatLng(city) {
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&key=AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I';

  https.get(url, function(resp) {
    var data = '';
    
    resp.on('data', function(chunk) {
      data += chunk;
    });
    
    resp.on('end', function() {
      console.log(JSON.parse(data));
    });
    
    }).on("error", function(err) {
      console.log("Error: " + err.message);
    });

}

// wrapper function for getGooglePlaces
function getPlaces(res, location, radius, type) {
  getGooglePlaces(res, location, radius, type);
}

// returns a list of places objects
function getGooglePlaces(res, location, radius, type) {
  var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I&location=' + location + '&radius=' + radius + '&type=' + type;
  https.get(url, function(resp) {
    var data = '';
    
    resp.on('data', function(chunk) {
      data += chunk;
    });
    
    resp.on('end', function() {
      results = JSON.parse(data)['results'];
      var places = [];
      for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var place = {};
        place['place_id'] = result['place_id'];
        place['name'] = result['name'];
        place['rating'] = result['rating'];
        place['latlng'] = result['geometry']['location']['lat'] + ',' + result['geometry']['location']['lng'];
        places.push(place);
      }

      res.send(places);
    });
    
    }).on("error", function(err) {
      console.log("Error: " + err.message);
    });
}

// Store name, lat-long, rating, address