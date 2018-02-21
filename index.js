var https = require('https')
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var google_key = 'AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I';

app.get('/', function(req, res) {
  console.log('home');
  getPlaces(res, 'Los Angeles', 500, 'restaurant');
  // getLatLng('San Francisco');
});

app.listen(port, function() {
  console.log('listening on: ' + port);
});

function extractLatLng(data){
  console.log(data);
  if(data['status'] != 'OK'){
    //zero results handling
  }
  else{
    latlng = String(data['results'][0].geometry.location.lat) + ','+ String(data['results'][0].geometry.location.lng);
    return latlng;
  }
}


// converts city to lat,lng string
function getLatLng(city, callback) {
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&key=AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I';
  https.get(url, function(resp) {
    var data = '';

    resp.on('data', function(chunk) {
      data += chunk;
    });

    resp.on('end', function() {
      callback(extractLatLng(JSON.parse(data)));
    });

    }).on("error", function(err) {
      console.log("Error: " + err.message);
    });

}

// wrapper function for getGooglePlaces
function getPlaces(res, city, radius, type) {
  getLatLng(city, function(latlng){
    getGooglePlaces(res, latlng, radius, type);
  });
}

// returns a list of places objects
function getGooglePlaces(res, location, radius, type) {
  var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I&location=' + location + '&radius=' + radius + '&type=' + type
  https.get(url, function(resp) {
    var data = '';

    resp.on('data', function(chunk) {
      data += chunk;
    });

    resp.on('end', function() {
      res.send(JSON.parse(data));
    });

    }).on("error", function(err) {
      console.log("Error: " + err.message);
    });
}

// Store name, lat-long, rating, address
