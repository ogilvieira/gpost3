"use strict"
module.exports = function(sequelize, DataTypes) {
  // Define resource
  var Taxonomy = sequelize.define('association', {
    target: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      defaultValue: "tag",
      allowNull: false
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "TAG",
      allowNull: false
    },
  }, {
    timestamps: false
  });

  Taxonomy.sync();
  return Taxonomy;
}
