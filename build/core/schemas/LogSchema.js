"use strict"
const sequelizePaginate = require('sequelize-paginate');

module.exports = function(sequelize, DataTypes) {
  // Define resource
  var Log = sequelize.define('log', {
    user: {
      type: DataTypes.STRING,
      allowNull: false
    },
    action: {
      type: DataTypes.STRING,
      defaultValue: "UPDATE",
      allowNull: false,
      validate: {
        isIn: [['CREATE','UPDATE', 'DELETE', 'ARCHIVE', 'UNARCHIVE']]
      }
    },
    target: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: false,
      validate: {
        isIn: [['ARTICLE', 'ARTICLE_FEATURED', 'POSTTYPE', 'CONFIG', 'USER', 'BANNER', 'BANNER_AREA']]
      }
    },
  }, {
    timestamps: true,
    createdAt: true,
    updatedAt: false
  });

  Log.sync();
  sequelizePaginate.paginate(Log);
  return Log;
}
