"use strict"
module.exports = function(sequelize, DataTypes) { 
  // Define resource
  var Banner = sequelize.define('banner', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    link: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    lang: {
      type: DataTypes.STRING,
      defaultValue: 'pt-br'      
    }
  });

  Banner.sync();
  return Banner;
}
