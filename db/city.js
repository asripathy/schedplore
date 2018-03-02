module.exports = function(sequelize, Sequelize) {
  var city = sequelize.define('city', {
    id: {
      type: Sequelize.TEXT,
      primaryKey: true
    },
    place_ids: {
      type: Sequelize.ARRAY(Sequelize.TEXT)
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });

  city.getCities = function(callback) {
    city.findAll().then(cities => {
      if (callback)
        callback(cities);
    });
  };

  city.getCity = function(id, callback) {
    city.findById(id).then(foundcity => {
      if (callback)
        callback(foundcity);
    });
  }

  city.addCity = function(id, place_ids, callback) {
    var options = {
      id: id,
      place_ids: place_ids
    };

    city.create(options).then(newcity => {
      if (callback)
        callback(newcity);
    }).catch(function(err) {
      console.log(err);
    });
  };

  city.updateCity = function(id, place_ids, callback) {
    var options = {
      id: id,
      place_ids: place_ids
    };

    city.update(options, {where: {id: id}}).then(numRowsUpdated => {
      if (callback)
        callback(numRowsUpdated);
    }).catch(function(err) {
      console.log(err);
    });
  };

  return city;
};
