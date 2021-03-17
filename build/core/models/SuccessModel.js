/**
 * @typedef Success
 * @property {string} message
 * @property {object} data
 */

function SuccessModel(message = "", data = "") {
  this.message = message || "Operação realizado com sucesso";
  this.data = data;
  return this;
}


module.exports = SuccessModel;
