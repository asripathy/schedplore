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
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });

  place.getPlaces = function(callback) {
    place.findAll().then(places => {
      if (callback)
        callback(places);
    });
  };

  place.getPlace = function(id, callback) {
    place.findById(id).then(foundPlace => {
      if (callback)
        callback(foundPlace);
    });
  }

  place.addPlace = function(id, name, rating, address, lat, lng, callback) {
    var options = {
      id: id,
      name: name,
      rating: rating,
      address: address,
      lat: lat,
      lng: lng
    };

    place.create(options).then(newPlace => {
      if (callback)
        callback(newPlace);
    }).catch(function(err) {
      console.log(err);
    });
  };

  place.updatePlace = function(id, name, rating, address, lat, lng, callback) {
    var options = {
      id: id,
      name: name,
      rating: rating,
      address: address,
      lat: lat,
      lng: lng
    };

    place.update(options, {where: {id: id}}).then(numRowsUpdated => {
      if (callback)
        callback(numRowsUpdated);
    }).catch(function(err) {
      console.log(err);
    });
  };

  place.upsertPlace = function(id, name, rating, address, lat, lng, callback) {
    var options = {
      id: id,
      name: name,
      rating: rating,
      address: address,
      lat: lat,
      lng: lng
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
