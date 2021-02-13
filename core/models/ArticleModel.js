const slugify = require('slugify');
const cheerio = require('cheerio');
const { extract } = require('oembed-parser');
const ErrorModel = require('./ErrorModel.js');
const TaxonomyModel = require('../../core/models/TaxonomyModel');
const UserModel = require('../../core/models/UserModel');
const { AssociationSchema, TaxonomySchema, UserSchema } = require('../../core/schemas');

/**
 * @typedef Article
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
 * @property {Taxonomy.model} category
 * @property {User.model} author
 * @property {Array<string>} tags
 * @property {object} custom_fields
 * @property {string} slug_key
 * @property {string} lang
 * @property {string} published_date
 */

function Article(data) {
  this.id = data.id;
  this.title = data.title;
  this.description = data.description;
  this.slug = data.slug ? data.slug : (data.title ? slugify(data.title, { replacement: '-', lower: true, remove: /[*+~.()'"!:@]/g }).toLowerCase() : "");
  this.cover = data.cover || "";
  this.content = data.content || "<div></div>";
  this.parent = data.parent || "";
  this.category = data.category || "";
  this.author = data.author || "";
  this.tags = data.tags || [];
  this.status = !!data.status;
  this.custom_fields = null;
  this.slug_key = data.slug_key;
  this.lang = data.lang;
  this.published_date = new Date(data.published_date || '').toISOString();
  this.updated_at = data.updatedAt || new Date().toISOString();
  this.created_at = data.createdAt || new Date().toISOString();
  this.is_editing_by = data.is_editing_by || "";

  if(!this.description) {
    this.description = this.content.replace(/(<([^>]+)>)/gi, "");
    if( this.description.length > 120 ) {
      this.description = this.description.slice(0, 117).trim()+"...";
    }
  }

  this.seo_title = data.seo_title || this.title;
  this.seo_description = data.seo_description || this.description;

  this.Populate = async () => {

    let tags = await AssociationSchema.findAll({
      where: { type: 'TAG', target: this.id },
      attributes: ['value']
    });

    this.tags = [];
    tags.map(tag => this.tags.push(tag.value));

    let custom_fields = await AssociationSchema.findAll({
      where: { type: 'ARTICLE_CUSTOM_FIELD', target: this.id },
      attributes: ['key','value']
    });

    this.custom_fields = {};
    custom_fields.map(cf => {
      this.custom_fields[cf.key] = cf.value;
    });

    if( this.category ) {

      let category = await TaxonomySchema.findOne({ where: {
        id: this.category,
        system: "ARTICLE",
        type: "CATEGORY",
      }});

      this.category = new TaxonomyModel(category);
    }

    if ( this.author ) {
      let author = await UserSchema.findOne({ where: {
        id: this.author
      }});

      this.author = new UserModel(author);
    }



    //content improoves
    const $html = cheerio.load(this.content);

    var oembedProms = [];

    $html('figure.media').each(function(a, b){
      $html(b).replaceWith(`<div class="media">${$html(b).html()}</div>`);
    });

    $html('oembed').each(function(a, b){

      let href = ($html(b).attr('url') || "").replace("http://", "https://");
      if( href.indexOf("youtu.be") >= 0 ){
        href = href.split("youtu.be/")[1];
        href = "https://www.youtube.com/watch?v=" + href;
      }

      $html(b).attr("href", href);

      oembedProms.push(new Promise(function(resolve, reject) {
        extract(href).then((oembed) => {
          $html(b).replaceWith(oembed.html);
          resolve(true);
        }).catch((err) => {
          $html(b).replaceWith(`<a href="${href}" target="_blank">${href}</a>`);
          reject();
        });
      }));

    });

    await Promise.all(oembedProms);
    this.content = $html('body').html();


    return this;

  };
}

module.exports = Article;
