const moment = require('moment');
      moment.locale('pt-br');

/**
 * @typedef User
 * @property {integer} id
 * @property {string} front_role
 * @property {string} name
 * @property {string} email
 * @property {string} bio
 * @property {string} last_access
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} role
 * @property {integer} active
 */

function User(data) {
  this.id = data.id || null;
  this.front_role = data.front_role || "";
  this.email = data.email || null;
  this.name = data.name || null;
  this.bio = data.bio || "";
  this.last_access = data.last_access || null;
  this.last_accessText = data.last_access ? moment(this.last_access).fromNow() : null;
  this.createdAt = data.createdAt || null;
  this.updatedAt = data.updatedAt || null;
  this.role = data.role || 'editor';
  this.active = data.active;

  return this;
}

module.exports = User;
