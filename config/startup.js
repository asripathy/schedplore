//Sets up DB connection with Sequelize
var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.DB_URI, {
  dialect: 'postgres',

  dialectOptions: {
    ssl: true
  },

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize
.authenticate()
.then(() => {
  console.log('Connection has been established successfully.');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});

module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize
}
