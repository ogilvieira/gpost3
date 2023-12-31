const slugify = require('slugify');
const ErrorModel = require('./ErrorModel.js');
/**
 * @typedef ArticleRaw
 * @property {integer} id
 * @property {string} title
 * @property {string} description
 * @property {string} slug
 * @property {string} seo_title
 * @property {string} seo_description
 * @property {string} cover
 * @property {string} content
 * @property {boolean} status
 * @property {integer} parent - Post Type ID
 * @property {integer} category
 * @property {integer} author
 * @property {Array<string>} tags
 * @property {object} custom_fields
 * @property {string} slug_key
 * @property {string} lang
 * @property {string} published_date
 */

function ArticleRaw(data) {
  this.id = data.id || "";
  this.title = data.title || "";
  this.description = data.description || "";
  this.slug = data.slug ? data.slug : (data.title ? slugify(data.title, { replacement: '-', lower: true, remove: /[*+~.()'"!:@,;]/g }).toLowerCase() : "");
  this.seo_title = data.seo_title || "";
  this.seo_description = data.seo_description  || "";
  this.cover = data.cover || "";
  this.content = data.content || "<div></div>";
  this.parent = data.parent || "";
  this.category = data.category || "";
  this.author = data.author || "";
  this.tags = data.tags || [];
  this.status = !!data.status;
  this.custom_fields = data.custom_fields || {};
  this.slug_key = `${this.slug||""}${this.category||""}${this.parent||""}`.toLowerCase();
  this.lang = data.lang || "pt-br";
  this.published_date = data.published_date || new Date().toISOString();
  this.updated_at = data.updatedAt || "";
  this.created_at = data.createdAt || "";
  this.is_editing_by = data.is_editing_by || "";
  this.archived = !!data.archived;

  if(!this.parent) {
    throw new ErrorModel("Article inválido.", { "parent" : "Parent é requerido." });
  }

  if(!this.author) {
    throw new ErrorModel("Article inválido.", { "author" : "Author é requerido." });
  }

  if(!this.title) {
    throw new ErrorModel("Article inválido.", { "title" : "Titulo é requerido." });
  }

  if(!this.content.replace(/(<([^>]+)>)/gi, "") || this.content.replace(/(<([^>]+)>)/gi, "").length < 3 ) {
    throw new ErrorModel("Article inválido.", { "content" : "Conteúdo é requerido." });
  }

}

module.exports = ArticleRaw;
