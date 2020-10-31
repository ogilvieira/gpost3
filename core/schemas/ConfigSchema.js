"use strict"
module.exports = function(sequelize, DataTypes) { 
  // Define resource
  var Schema = sequelize.define('config', {
    key_value: {
      type: DataTypes.STRING
    },
    key_slug: {
      type: DataTypes.STRING,
      unique: true
    },
    key_name: {
      type: DataTypes.STRING
    },
    key_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "TEXT"
    },
    custom_type: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    lang: {
      type: DataTypes.STRING,
      defaultValue: 'pt-br'      
    }
  });

  Schema.sync();
  return Schema;
};
