const place = require('./db/place.js');
const city = require('./db/city.js');
const startup = require('./db/startup.js');
const Sequelize = startup.Sequelize;
const sequelize = startup.sequelize;


var Place = place(sequelize, Sequelize);
var City = city(sequelize, Sequelize);

function retrievePlaces(city, callback) {
    City.getCity(city, function(city) {
    var placeIds = city['dataValues']['place_ids'];
    var newPlaces = [];
    placeIds.forEach(function(placeId) {
        Place.getPlace(placeId, function(place) {
        newPlaces.push(place);
        if (newPlaces.length == placeIds.length) {
            callback(newPlaces);
        }
        });
    });
    });
}

module.exports = {
  // Assumes data for city has been loaded into database
  // Will pass 3d array to callback:
  // Layer 1: Days
  // Layer 2: Hours
  // Layer 3: Place Objects
  createScheduleOptions: function(city, callback){
    retrievePlaces(city, function(places){
      let scheduleOptions = Array(7).fill().map(() => Array(24).fill().map(() => Array()));
      for(var i = 0; i < places.length; i++){
        let hours = places[i].hours;
        for(var j = 0; j < hours.length; j++){
            for(var k = 0; k < hours[j].length; k++){
                if(hours[j][k]){
                    scheduleOptions[j][k].push(places[i]);
                }
            }
        }
      }
      callback(scheduleOptions);
    })
  }
};