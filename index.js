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
var City = city(sequelize, Sequelize);
var schedule = require('./schedule.js');

app.get('/', function (req, res) {
  // getPlaces(res, 'San Jose', 500, 'restaurant');
  // TODO make sure this gets called at appropriate time
  // schedule.createScheduleOptions('San Jose', function(sched) {
  //   res.send(sched);
  // });
});

app.get('/place/:place', function (req, res) {
  var place = req.params.place;
  City.getCity(place, function (city) {
    if (!city) {
      getPlaces(res, place, 500, 'restaurant', () => {
        schedule.createScheduleOptions(place, function (sched) {
          res.send(sched);
        });
      });
    } else {
      schedule.createScheduleOptions(place, function (sched) {
        res.send(sched);
      });
    }
  });
});

app.listen(port, function () {
  console.log('listening on: ' + port);
});


// converts city to lat,lng string
function getLatLng(city, callback) {
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&key=AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I';
  https.get(url, function (resp) {
    var data = '';

    resp.on('data', function (chunk) {
      data += chunk;
    });

    resp.on('end', function () {
      data = JSON.parse(data);
      if (data['status'] != 'OK') {
        console.log("ERROR: No Results Found");
        //zero results handling
      }
      else {
        latlng = data['results'][0].geometry.location.lat + ',' + data['results'][0].geometry.location.lng;
        callback(latlng);
      }
    });

  }).on("error", function (err) {
    console.log("Error: " + err.message);
  });

}

// wrapper function for getGooglePlaces
function getPlaces(res, city, radius, type, callback) {
  getLatLng(city, function (latlng) {
    getGooglePlaces(res, city, latlng, radius, type, callback);
  });
}

// returns a list of places objects
function getGooglePlaces(res, city, location, radius, type, callback) {
  var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I&location=' + location + '&radius=' + radius + '&type=' + type;
  https.get(url, function (resp) {
    var data = '';

    resp.on('data', function (chunk) {
      data += chunk;
    });

    resp.on('end', function () {
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
      getPlaceHours(places, function (newPlaces) {
        populateDB(city, newPlaces, callback);
      })
    });

  }).on("error", function (err) {
    console.log("Error: " + err.message);
  });
}

/*Testing Function*/
function prettyPrintHours(hours) {
  for (var i = 0; i < 7; i++) {
    console.log("lenn: " + hours[i].length);
    console.log("Day " + i + ": ");
    console.log(hours[i]);
  }
}

function parseHours(periods, callback) {
  let hours = Array(7).fill().map(() => Array(24).fill(0));
  for (var i = 0; i < periods.length; i++) {
    var close = periods[i]['close'];
    var open = periods[i]['open'];
    var startDay = open['day'];
    var startTime = parseInt(open['time'].substring(0, 2));
    var closeDay = close['day'];
    var closeTime = parseInt(close['time'].substring(0, 2));
    if (startDay != closeDay) {
      for (var hour = startTime; hour < 24; hour++) {
        hours[startDay][hour] = 1;
      }
      for (var hour = 0; hour < closeTime; hour++) {
        hours[closeDay][hour] = 1;
      }
    }
    else {
      for (var hour = startTime; hour < closeTime; hour++) {
        hours[startDay][hour] = 1;
      }
    }
  }
  callback(hours);
}

function parseTime(time) {
  var hour = parseInt(time.substring(0, 3));
  return hour;
}

//Gets hours for place given place_id
function getPlaceHours(places, callback) {
  newPlaces = [];
  original_places_len = places.length;
  places.forEach(function (place, i) {
    var url = "https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyDEPGdDuGRpSFSlQ1tXy5EIAosKAtp8f5I&placeid=" + place['place_id'];
    https.get(url, function (resp) {
      var data = '';

      resp.on('data', function (chunk) {
        data += chunk;
      });

      resp.on('end', function () {
        hours = JSON.parse(data);

        // only call parse hours if the place has hours
        if (!hours['result']['opening_hours'] || !hours['result']['opening_hours']['periods']) {
          original_places_len -= 1;
          if (newPlaces.length == original_places_len) {
            callback(newPlaces);
          }
        } else {
          parseHours(hours['result']['opening_hours']['periods'], function (parsedHours) {
            place['hours'] = parsedHours;
            newPlaces.push(place);
            if (newPlaces.length == original_places_len) {
              callback(newPlaces);
            }
          });
        }
      })
    })
  });
}

function populateDB(city, places, callback) {
  place_ids = [];
  var promises = [];
  for (let i = 0; i < places.length; i++) {
    var place = places[i];
    place_ids.push(place.place_id);
    // Place.upsertPlace(place.place_id, place.name, place.rating, place.address, place.lat, place.lng, place.hours);
    promises.push(Place.upsertPlacePromise(place.place_id, place.name, place.rating, place.address, place.lat, place.lng, place.hours));
  }
  promises.push(City.upsertCityPromise(city, place_ids));

  Promise.all(promises).then(() => {
    callback();
  });
}
