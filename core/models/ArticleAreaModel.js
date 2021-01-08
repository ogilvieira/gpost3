const slugify = require('slugify');

/**
 * @typedef ArticleArea
 * @property {integer} id
 * @property {string} title
 * @property {string} seo_title
 * @property {string} description
 * @property {string} seo_description
 * @property {string} slug
 * @property {object} custom_fields
 * @property {string} lang
 */

function ArticleAreaModel(data) {
  this.id = data.id || "";
  this.title = data.title || "";
  this.seo_title = data.seo_title || "";
  this.description = data.description || "";
  this.seo_description = data.seo_description  || "";
  this.slug = data.slug || data.title ? slugify(data.title).toLowerCase() : "";
  this.show_in_search = data.show_in_search || false;
  this.custom_fields = data.custom_fields || [];
  this.lang = data.lang || "pt-br";
}

module.exports = ArticleAreaModel;
