module.exports = function(sequelize, Sequelize) {
  return sequelize.define('city', {
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
  })
};
