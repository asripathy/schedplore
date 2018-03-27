module.exports = function(sequelize, Sequelize) {
  var place = sequelize.define('place', {
    id: {
      type: Sequelize.TEXT,
      primaryKey: true
    },
    name: {
      type: Sequelize.TEXT
    },
    rating: {
      type: Sequelize.DOUBLE
    },
    address: {
      type: Sequelize.TEXT
    },
    lat: {
      type: Sequelize.DOUBLE
    },
    lng: {
      type: Sequelize.DOUBLE
    },
    hours: {
      type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.TINYINT))
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });

  // Place.getPlaces(function(places) {
  //   console.log(places);
  // });
  place.getPlaces = function(callback) {
    place.findAll().then(places => {
      if (callback)
        callback(places);
    });
  };

  // Place.getPlace('456', function(place) {
  //   console.log(place);
  // });
  place.getPlace = function(id, callback) {
    place.findById(id).then(foundPlace => {
      if (callback)
        callback(foundPlace);
    });
  }

  // Place.addPlace('456', 'berkeley', 3.0, 'durant ave.', 122.03, -33.2, function(place) {
  //   console.log(place);
  // });
  place.addPlace = function(id, name, rating, address, lat, lng, hours, callback) {
    var options = {
      id: id,
      name: name,
      rating: rating,
      address: address,
      lat: lat,
      lng: lng,
      hours: hours
    };

    place.create(options).then(newPlace => {
      if (callback)
        callback(newPlace);
    }).catch(function(err) {
      console.log(err);
    });
  };

  // Place.updatePlace('456', 'berkeley', 4.0, 'durant ave. 2', 122.03, -33.2, function(rowsUpdated) {
  //   console.log(rowsUpdated);
  // });
  place.updatePlace = function(id, name, rating, address, lat, lng, hours, callback) {
    var options = {
      id: id,
      name: name,
      rating: rating,
      address: address,
      lat: lat,
      lng: lng,
      hours: hours
    };

    place.update(options, {where: {id: id}}).then(numRowsUpdated => {
      if (callback)
        callback(numRowsUpdated);
    }).catch(function(err) {
      console.log(err);
    });
  };

  // Place.upsertPlace('456', 'berkeley', 4.0, 'durant ave. 2', 122.03, -33.2, function(rowsUpdated) {
  //   console.log(rowsUpdated);
  // });
  place.upsertPlace = function(id, name, rating, address, lat, lng, hours, callback) {
    var options = {
      id: id,
      name: name,
      rating: rating,
      address: address,
      lat: lat,
      lng: lng,
      hours: hours
    };

    place.upsert(options, {where: {id: id}}).then(created => {
      if (callback)
        callback(created);
    }).catch(function(err) {
      console.log(err);
    });
  };

  return place;
};
