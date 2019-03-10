var https = require('https')
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;

require('dotenv').config();
var google_key = process.env.GOOGLE_API_KEY;

const place = require('./models/place.js');
const city = require('./models/city.js');
const startup = require('./config/startup.js');
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
  res.sendfile('./views/index.html');
});

app.get('/place/:place', function (req, res) {
  var place = req.params.place;
  City.getCity(place, function (city) {
    if (!city) {
      getPlaces(res, place, () => {
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
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&key=' + google_key;
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
function getPlaces(res, city, callback) {
  getLatLng(city, function (latlng) {
    // TODO do search sanitization
    cityName = city.substring(0, city.indexOf(','));
    getGooglePlaces(res, cityName, 'food', [], function(restaurants) {
      getGooglePlaces(res, cityName, 'attraction', restaurants, function(allPlaces) {
          getPlacePhotos(allPlaces, function (placesWithPhotos) {
            getPlaceHours(placesWithPhotos, function (finalPlaces) {
              populateDB(city, finalPlaces, callback);
            });
        });
      });
    });
    
  });
}

// returns a list of places objects
function getGooglePlaces(res, city, type, curPlaces, callback) {
  var searchQuery = '';
  if (type == 'food') {
    searchQuery = ' restaurants';
  } else {
    searchQuery= ' things to do'
  }
  var url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?key=' + google_key +  '&query=' + city + searchQuery;
  https.get(url, function (resp) {
    var data = '';

    resp.on('data', function (chunk) {
      data += chunk;
    });

    resp.on('end', function () {
      results = JSON.parse(data)['results'];
      var places = curPlaces;
      for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var place = {};
        if ('formatted_address' in result) {
          var formatted = result['formatted_address'];
          var formattedAbbrev;
          var numSpaces = formatted.split(' ').length - 1;
          if (numSpaces > 0) {
            var formattedAbbrev = formatted.substring(0, formatted.lastIndexOf(' '));
            if (numSpaces > 1) {
              formattedAbbrev = formatted.substring(0, formattedAbbrev.lastIndexOf(' '));
            }
            while (!formattedAbbrev.charAt(formattedAbbrev.length - 1).match(/[a-z]/i) && formattedAbbrev.length > 0) {
              formattedAbbrev = formattedAbbrev.substring(0, formattedAbbrev.length - 1);
            }
            place['address'] = formattedAbbrev;
          }
          else {
            place['address'] = formatted;
          }
        }
        else {
          place['address'] = "";
        }
        place['place_id'] = result['place_id'];
        place['name'] = result['name'];
        place['rating'] = result['rating'];
        place['lat'] = result['geometry']['location']['lat'];
        place['lng'] = result['geometry']['location']['lng'];
        place['type'] = type;
        if (result['photos'] && result['photos'].length > 0 && result['photos'][0]['photo_reference']) {
          place['photo_reference'] = result['photos'][0]['photo_reference'];
        } else {
          place['photo_reference'] = null;
        }
        places.push(place);
      }

      callback(places);
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
    var closeDay = undefined;
    var closeTime = undefined;
    
    if (close) {
      closeDay = close['day'];
      closeTime = parseInt(close['time'].substring(0, 2));
    }
    
    if (!close) {
      for (var hour = startTime; hour < 24; hour++) {
        hours[startDay][hour] = 1;
      }
    } else if (startDay != closeDay) {
      for (var hour = startTime; hour < 24; hour++) {
        hours[startDay][hour] = 1;
      }
      for (var hour = 0; hour < closeTime; hour++) {
        hours[closeDay][hour] = 1;
      }
    } else {
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
    var url = "https://maps.googleapis.com/maps/api/place/details/json?key=" + google_key + "&placeid=" + place['place_id'];
    https.get(url, function (resp) {
      var data = '';

      resp.on('data', function (chunk) {
        data += chunk;
      });

      resp.on('end', function () {
        hours = JSON.parse(data);

        // only call parse hours if the place has hours
        console.log(hours)
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

function getPlacePhotos(places, callback) {
  newPlaces = [];
  num_to_process = places.length;

  places.forEach(function (place, i) {
    num_to_process -= 1;
    if (!places[i].photo_reference) {
      place['photo'] = null;
    } else { 
      var url = "https://maps.googleapis.com/maps/api/place/photo?key=" + google_key + "&maxheight=600&photoreference=" + place.photo_reference;
      https.get(url, function (resp) {
        var data = '';

        resp.on('data', function (chunk) {
          data += chunk;
        });

        resp.on('end', function () {
          // TODO clean this up later
          var imgtag_index = data.indexOf('<A HREF="');
          if (imgtag_index == -1) {
            place['photo'] = null;
          } else {
            var img_url = data.substr(imgtag_index + 9);
            img_url = img_url.substr(0, img_url.indexOf('"'));
            place['photo'] = img_url;
          }
          console.log(place.photo);
        })
      })
    }
    newPlaces.push(place);
  });

  if (num_to_process == 0) {
    callback(newPlaces);
  }
}

function populateDB(city, places, callback) {
  console.log('IN POPULATE DB');
  console.log(city);
  console.log(places);
  place_ids = [];
  var promises = [];
  for (let i = 0; i < places.length; i++) {
    var place = places[i];
    place_ids.push(place.place_id);
    // Place.upsertPlace(place.place_id, place.name, place.rating, place.address, place.lat, place.lng, place.hours);
    promises.push(Place.upsertPlacePromise(place.place_id, place.name, place.rating, place.address, place.lat, place.lng, place.hours, place.photo_reference, place.photo, place.type));
  }
  promises.push(City.upsertCityPromise(city, place_ids));

  Promise.all(promises).then(() => {
    callback();
  });
}
