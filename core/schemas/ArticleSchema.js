"use strict"
const sequelizePaginate = require('sequelize-paginate');

module.exports = function(sequelize, DataTypes) {
  var Article = sequelize.define('article', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    slug: {
      type: DataTypes.STRING
    },
    seoTitle: {
      type: DataTypes.STRING
    },
    seoDescription: {
      type: DataTypes.STRING
    },
    cover: {
      type: DataTypes.STRING
    },
    content: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    parent: {
      type: DataTypes.STRING,
      defaultValue: "1"
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slugKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    tags: {
      type: DataTypes.TEXT
    },
    customFields: {
      type: DataTypes.TEXT
    },
    publishedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    isEditingBy: {
      type: DataTypes.STRING
    },
    lang: {
      type: DataTypes.STRING,
      defaultValue: 'pt-br'
    }
  });

  Article.sync();
  sequelizePaginate.paginate(Article);
  return Article;
}
