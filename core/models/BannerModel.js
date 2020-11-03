/**
 * @typedef Banner
 * @property {integer} id
 * @property {string} title
 * @property {string} image
 * @property {string} link
 * @property {integer} order
 * @property {integer} category
 * @property {string} start_date
 * @property {string} end_date
 * @property {string} lang
 */

function BannerModel(data) {
  this.id = data.id || null;
  this.title = data.title || null;
  this.image = data.image || null;
  this.link = data.link || null;
  this.order = data.order || 0;
  this.category = data.category || null;
  this.start_date = data.start_date || new Date().toISOString();
  this.end_date = data.end_date || new Date().toISOString();
  this.lang = data.lang || "pt-br";
}

module.exports = BannerModel;
