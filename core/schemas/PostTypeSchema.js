"use strict"
const sequelizePaginate = require('sequelize-paginate');

module.exports = function(sequelize, DataTypes) { 
  // Define resource
  var PostType = sequelize.define('posttype', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'article'
    },
    show_in_search: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    description: {
      type: DataTypes.STRING
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
