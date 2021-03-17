"use strict"
const bcrypt = require('bcryptjs');
const sequelizePaginate = require('sequelize-paginate');

module.exports = function(sequelize, DataTypes) { 
  // Define resource
  const Schema = sequelize.define('user', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    front_role: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bio: {
      type: DataTypes.STRING
    },
    token: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'editor'
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_access: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
  },{
    freezeTableName: true,
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      }
    }
  });


  Schema.sync();
  sequelizePaginate.paginate(Schema);
  return Schema;
}
