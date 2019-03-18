var https = require('https')
var express = require('express');
const path = require('path');
var app = express();
var port = process.env.PORT || 5000;

require('dotenv').config();
var google_key = process.env.GOOGLE_API_KEY;

const place = require('./models/place.js');
const city = require('./models/city.js');
const startup = require('./config/startup.js');
const Sequelize = startup.Sequelize;
const sequelize = startup.sequelize;

// Models
var Place = place(sequelize, Sequelize);
var City = city(sequelize, Sequelize);
var schedule = require('./controllers/schedule.js');

// Error
var api_key_error = false;

//Static file declaration
app.use(express.static(path.join(__dirname, 'client/build')));

//production mode
if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('/', (req, res) => {
    res.sendfile(path.join(__dirname = 'client/build/index.html'));
  })
}
//build mode
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/public/index.html'));
})

app.get('/place/:place', function (req, res) {
  var place = req.params.place;
  City.getCity(place, function (city) {
    if (!city) {
      getPlaces(res, place, (status) => {
        if (status == 200) {
          schedule.createScheduleOptions(place, function (sched) {
            res.send(sched);
          });
        }
        else if (status == 501) {
          res.status(501).send('Google error occurred.')
        }  
        else if (status == 500) {
          res.status(500).send('No places found for this city.');
        } 
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

// wrapper function for getGooglePlaces
function getPlaces(res, city, callback) {
  api_key_error = false;
  getGooglePlaces(res, city, 'food', [], function(restaurants) {
    getGooglePlaces(res, city, 'attraction', restaurants, function(allPlaces) {
        getPlacePhotos(allPlaces, function (placesWithPhotos) {
          getPlaceHours(placesWithPhotos, function (finalPlaces) {
            populateDB(city, finalPlaces, callback);
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
      var parsed_data = JSON.parse(data);
      results = parsed_data['results'];
      if (parsed_data.status == 'ZERO_RESULTS') {
        callback([]);
        return;
      }
      if (parsed_data.status != 'OK') {
        api_key_error = true;
        callback([]);
        return;
      }
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
          } else {
            place['address'] = formatted;
          }
        } else {
          place['address'] = null;
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
  if (places.length == 0) {
    callback(newPlaces);
  }
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
          var imgtag_index = data.indexOf('<A HREF="');
          if (imgtag_index == -1) {
            place['photo'] = null;
          } else {
            var img_url = data.substr(imgtag_index + 9);
            img_url = img_url.substr(0, img_url.indexOf('"'));
            place['photo'] = img_url;
          }
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
  if (api_key_error) {
    callback(501);
    return;
  }
  else if (places.length == 0) {
    callback(500);
    return;
  }
  place_ids = [];
  var promises = [];
  for (let i = 0; i < places.length; i++) {
    var place = places[i];
    place_ids.push(place.place_id);
    promises.push(Place.upsertPlacePromise(place.place_id, place.name, place.rating, place.address, place.lat, place.lng, place.hours, place.photo_reference, place.photo, place.type));
  }
  promises.push(City.upsertCityPromise(city, place_ids));
  Promise.all(promises).then(() => {
    callback(200);
  });
}
