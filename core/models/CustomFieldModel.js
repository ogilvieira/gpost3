const slugify = require('slugify');

/**
 * @typedef CustomField
 * @property {string} title
 * @property {string} key
 * @property {boolean} required
 * @property {integer} minlength
 * @property {integer} maxlength
 * @property {string} options
 * @property {string} type
 */

function CustomFieldModel(data) {
  this.title = data.title;
  this.key = data.key || slugify(data.title, { replacement: '-', lower: true, remove: /[*+~.()'"!:@]/g });
  this.required = typeof data.required != 'undefined' ? data.required : false;
  this.minlength = data.minlength || 0;
  this.maxlength = data.maxlength || 0;
  this.options = data.options || "";
  this.type = (data.type || "TEXT").toUpperCase();

  let types = ['TEXT', 'SELECT', "MULTIPLE", "URL", "IMAGE", "DATE"];

  if(!types.find(a => a == this.type)){
    throw new ErrorModel('Invalid type property for CustomFieldModel');
  }

  return this;

}

module.exports = CustomFieldModel;
