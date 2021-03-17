/**
 * @typedef Log
 * @property {User.model} user
 * @property {string} action
 * @property {integer} target
 * @property {string} type
 * @property {string} createdAt
 */

function LogModel(data) {
  this.user = data.user || null;
  this.action = data.action || null;
  this.target = data.target || null;
  this.type = data.type || null;
  this.createdAt = data.createdAt || null;
}

module.exports = LogModel;
