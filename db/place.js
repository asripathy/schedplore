module.exports = function(sequelize, Sequelize) {
  return sequelize.define('place', {
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
  })
};
