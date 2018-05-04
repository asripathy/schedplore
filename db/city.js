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

  /*Usage Example:
     City.getCities(function(cities) {
       console.log(cities);
     });
  */
  city.getCities = function(callback) {
    city.findAll().then(cities => {
      if (callback)
        callback(cities);
    });
  };

  /*Usage Example:
   City.getCity('san fran', function(city) {
     console.log(city);
   });
  */
  city.getCity = function(id, callback) {
    city.findById(id).then(foundcity => {
      if (callback)
        callback(foundcity);
    });
  }

  /*Usage Example:
   City.addCity('berkeley', ['456'], function(city) {
    console.log(city);
   });
  */
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

/*Usage Example:
  City.updateCity('berkeley', ['666'], function(rowsUpdated) {
   console.log(rowsUpdated);
  });
*/
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

  city.upsertCity = function(id, place_ids, callback) {
    var options = {
      id: id,
      place_ids: place_ids
    };

    city.upsert(options, {where: {id: id}}).then(created => {
      if (callback)
        callback(created);
    }).catch(function(err) {
      console.log(err);
    });
  };

  city.upsertCityPromise = function(id, place_ids, callback) {
    var options = {
      id: id,
      place_ids: place_ids
    };

    return new Promise(function(resolve, reject) {
      city.upsert(options, {where: {id: id}}).then(created => {
        resolve(created);
      }).catch(function(err) {
        reject(err);
      });
    });
  };


  return city;
};
