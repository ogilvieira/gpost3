const slugify = require('slugify');

/**
 * @typedef Taxonomy
 * @property {integer} id
 * @property {string} title
 * @property {string} description
 * @property {string} slug
 * @property {string} system
 * @property {number} parent - optional parent id
 * @property {string} type
 * @property {string} slug_key
 */

function TaxonomyModel(data) {
  this.id = data.id || null;
  this.title = data.title || null;
  this.description = data.description || null;
  this.slug = data.slug || data.title ? slugify(data.title).toLowerCase() : null;
  this.system = data.system || "ARTICLE";
  this.parent = data.parent || null;
  this.type = data.type || "CATEGORY";
  this.slug_key = `${this.slug||""}${this.type||""}${this.system||""}${this.parent||""}`.toLowerCase();
}

module.exports = TaxonomyModel;
