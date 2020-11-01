/**
 * @typedef Generic
 * @property {integer} id
 * @property {string} title
 * @property {string} description
 * @property {string} description
 * @property {object} custom_fields
 */

function GenericPosttypeModel(data) {
  this.id = data.id || null;
  this.title = data.title || "";
  this.description = data.description || "";
  this.system = "ARTICLE";
  this.show_in_search = true;
  this.cover = data.cover || "";
  this.slug = data.slug || null;
  this.seo_title = data.seo_title || data.title || "";
  this.seo_description = data.seo_description || data.description || "";
  this.custom_fields = data.custom_fields || [];
  this.lang = data.lang || 'pt-br';

  return this;
}

module.exports = BannerPosttypeModel;
