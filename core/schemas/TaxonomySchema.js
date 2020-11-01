"use strict"
module.exports = function(sequelize, DataTypes) { 
  // Define resource
  var Taxonomy = sequelize.define('taxonomy', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    system: {
      type: DataTypes.STRING,
      defaultValue: "ARTICLE"
    },
    parent: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "CATEGORY"
    },
    slug_key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    lang: {
      type: DataTypes.STRING,
      defaultValue: 'pt-br'      
    }
  });

  Taxonomy.sync();
  return Taxonomy;
}
