/**
 * @typedef BannerPosttype
 * @property {integer} id
 * @property {string} title
 * @property {string} description
 * @property {string} description
 * @property {object} custom_fields
 */

function BannerPosttypeModel(data) {
  this.id = data.id || null;
  this.title = data.title || "";
  this.description = data.description || "";
  this.system = "BANNER";
  this.show_in_search = false;
  this.slug = data.slug || null;
  this.custom_fields = data.custom_fields || [];
  this.lang = data.lang || 'pt-br';

  return this;
}

module.exports = BannerPosttypeModel;
