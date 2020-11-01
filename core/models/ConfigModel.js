/**
 * @typedef Config
 * @property {integer} id
 * @property {string} key_value
 * @property {string} key_slug
 * @property {string} key_name
 * @property {string} key_type
 * @property {boolean} custom_type
 */

function ConfigModel(data) {
  this.id = data.id || null;
  this.key_value = data.key_value || null;
  this.key_slug = data.key_slug || null;
  this.key_type = data.key_type || null;
  this.custom_type = data.custom_type || 0;
}

module.exports = ConfigModel;
