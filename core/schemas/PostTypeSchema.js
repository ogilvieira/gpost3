"use strict"
const sequelizePaginate = require('sequelize-paginate');

module.exports = function(sequelize, DataTypes) { 
  // Define resource
  var PostType = sequelize.define('posttype', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    system: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ARTICLE'
    },
    show_in_search: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    cover: {
      type: DataTypes.STRING
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false
    },
    seo_title: {
      type: DataTypes.STRING
    },
    seo_description: {
      type: DataTypes.STRING
    },
    custom_fields: {
      type: DataTypes.TEXT
    },
    lang: {
      type: DataTypes.STRING,
      defaultValue: 'pt-br'
    }
  });

  PostType.sync();
  sequelizePaginate.paginate(PostType);
  return PostType;
}
