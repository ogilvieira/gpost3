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
    seo_title: {
      type: DataTypes.STRING
    },
    seo_description: {
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
    category: {
      type: DataTypes.STRING
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug_key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    tags: {
      type: DataTypes.TEXT
    },
    custom_fields: {
      type: DataTypes.TEXT
    },
    published_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    is_editing_by: {
      type: DataTypes.STRING
    },
    lang: {
      type: DataTypes.STRING,
      defaultValue: 'pt-br'
    }
  });

  Article.addHook('beforeValidate', async (article, options) => {
    article.custom_fields = JSON.stringify(article.custom_fields);
    article.tags = article.tags.join(",");
  });

  Article.sync();
  sequelizePaginate.paginate(Article);
  return Article;
}
