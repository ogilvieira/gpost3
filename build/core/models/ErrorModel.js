/**
 * @typedef Error
 * @property {string} message
 * @property {object.<string>} models
 */

function ErrorModel(message = "", models = null) {
  this.message = message || "Operação inválida";
  this.models = (typeof models == 'object') ? models : {};
  if(!models) { delete this.models; }
}


module.exports = ErrorModel;
