const place = require('./db/place.js');
const city = require('./db/city.js');
const startup = require('./db/startup.js');
const Sequelize = startup.Sequelize;
const sequelize = startup.sequelize;


var Place = place(sequelize, Sequelize);
var City = city(sequelize, Sequelize);

function retrievePlaces(city, callback) {
    City.getCity(city, function (city) {
        var placeIds = city['dataValues']['place_ids'];
        var newPlaces = [];
        placeIds.forEach(function (placeId) {
            Place.getPlace(placeId, function (place) {
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
    createScheduleOptions: function (city, callback) {
        retrievePlaces(city, function (places) {
            let scheduleOptions = [...Array(7)].map(e => Array(24));
    
            for (let day = 0; day < 7; day++) {
                for (let hour = 0; hour < 24; hour++) {
                    let openPlaces = [];
                    places.map((place) => {
                        if (place.hours[day][hour] === "1") {
                            let newPlace = {};
                            newPlace.id = place.id;
                            newPlace.name = place.name;
                            newPlace.rating = place.rating;
                            newPlace.address = place.address;
                            newPlace.lat = place.lat;
                            newPlace.lng = place.lng;
                            newPlace.photo_reference = place.photo_reference;
                            openPlaces.push(newPlace);
                        }
                    });
    
                    scheduleOptions[day][hour] = openPlaces;
                }
            }
            callback(scheduleOptions);
        })
    }
};