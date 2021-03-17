const slugify = require('slugify');
const CustomFieldModel = require('./CustomFieldModel.js');
/**
 * @typedef ArticleArea
 * @property {integer} id
 * @property {string} title
 * @property {string} seo_title
 * @property {string} description
 * @property {string} seo_description
 * @property {string} slug
 * @property {boolean} show_in_search
 * @property {Array<CustomField>} custom_fields
 * @property {string} lang
 */

function ArticleAreaModel(data) {
  this.id = data.id || "";
  this.title = data.title || "";
  this.seo_title = data.seo_title || "";
  this.description = data.description || "";
  this.seo_description = data.seo_description  || "";
  this.slug = data.slug ? data.slug : (data.title ? slugify(data.title).toLowerCase() : "");
  this.show_in_search = !!data.show_in_search;
  this.custom_fields = data.custom_fields || [];
  this.lang = data.lang || "pt-br";


  if( typeof this.custom_fields == 'string') {
    this.custom_fields = JSON.parse(this.custom_fields);
    this.custom_fields.map(a => new CustomFieldModel(a));
  }
}

module.exports = ArticleAreaModel;
