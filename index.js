var https = require('https')
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var google_key = 'AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I';

const place = require('./db/place.js');
const city = require('./db/city.js');
const startup = require('./db/startup.js');
const Sequelize = startup.Sequelize;
const sequelize = startup.sequelize;


var Place = place(sequelize, Sequelize);
// Place.getPlaces(function(places) {
//   console.log(places);
// });

// Place.getPlace('456', function(place) {
//   console.log(place);
// });

// Place.addPlace('456', 'berkeley', 3.0, 'durant ave.', 122.03, -33.2, function(place) {
//   console.log(place);
// });

// Place.updatePlace('456', 'berkeley', 4.0, 'durant ave. 2', 122.03, -33.2, function(rowsUpdated) {
//   console.log(rowsUpdated);
// });

var City = city(sequelize, Sequelize);
// City.getCities(function(cities) {
//   console.log(cities);
// });

// City.getCity('san fran', function(city) {
//   console.log(city);
// });

// City.addCity('berkeley', ['456'], function(city) {
//   console.log(city);
// });

// City.updateCity('berkeley', ['666'], function(rowsUpdated) {
//   console.log(rowsUpdated);
// });


app.get('/', function(req, res) {
  getPlaces(res, 'San Jose', 500, 'restaurant');
});

app.listen(port, function() {
  console.log('listening on: ' + port);
});


// converts city to lat,lng string
function getLatLng(city, callback) {
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&key=AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I';
  https.get(url, function(resp) {
    var data = '';

    resp.on('data', function(chunk) {
      data += chunk;
    });

    resp.on('end', function() {
      data = JSON.parse(data);
      if(data['status'] != 'OK'){
        console.log("ERROR: No Results Found");
        //zero results handling
      }
      else{
        latlng = data['results'][0].geometry.location.lat + ','+ data['results'][0].geometry.location.lng;
        callback(latlng);
      }
    });

    }).on("error", function(err) {
      console.log("Error: " + err.message);
    });

}

// wrapper function for getGooglePlaces
function getPlaces(res, city, radius, type) {
  getLatLng(city, function(latlng) {
    getGooglePlaces(res, city, latlng, radius, type);
  });
}

// returns a list of places objects
function getGooglePlaces(res, city, location, radius, type) {
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
        place['address'] = result['vicinity'];
        place['lat'] = result['geometry']['location']['lat'];
        place['lng'] = result['geometry']['location']['lng'];
        places.push(place);
      }

      populateDB(city, places);
    });

    }).on("error", function(err) {
      console.log("Error: " + err.message);
    });
}

function populateDB(city, places) {
  place_ids = [];
  for (let i = 0; i < places.length; i++) {
    var place = places[i];
    place_ids.push(place.place_id);
    Place.addPlace(place.place_id, place.name, place.rating, place.address, place.lat, place.lng);
  }
  City.addCity(city, place_ids);
}
