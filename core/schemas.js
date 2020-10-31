const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASS, {
  host: process.env.MYSQL_URL,
  dialect: 'mysql',
  operatorsAliases: 0,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  query: { 
    raw: true
  }
});


var db = {};

fs.readdirSync(path.join(__dirname, 'schemas/')).forEach(function(filename) {
  var schema = {};
  schema.path = path.join(__dirname, 'schemas/', filename)
  schema.name = filename.replace(/\.[^/.]+$/, "");
  db[schema.name] = require(schema.path)(sequelize, Sequelize);;
});


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
