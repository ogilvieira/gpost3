const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const TaxonomyModel = require('../../core/models/TaxonomyModel');
const ArticleAreaModel = require('../../core/models/ArticleAreaModel');
const CustomFieldModel = require('../../core/models/CustomFieldModel');
const { PostTypeSchema, Sequelize } = require('../../core/schemas');

/**
 * @route GET /rest/posttype/{id}
 * @group Post Type
 * @param {integer} id.path
 * @returns {ArticleArea.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.get = async (data, req, res, next) => {

  const id = req.params.id;

  if(!id) { return res.status(403).send(new ErrorModel()) }

  try {
    var articleArea = await PostTypeSchema.findOne({ where: { id: id, system: 'ARTICLE' } });

    if(!articleArea) { throw null; }
    articleArea = new ArticleAreaModel(articleArea);
    return res.send(articleArea);
  } catch (err) {
    console.log('err', err);
    return res.status(404).send(new ErrorModel("Área de artigos não encontrada."));
  }

}


/**
 * @route PUT /rest/posttype/{id}
 * @group Post Type
 * @param {integer} id.path
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.update = async (data, req, res, next) => {

  const id = req.params.id;

  if(!id) { return res.status(403).send(new ErrorModel()) }

  try {
    let articleArea = new ArticleAreaModel(req.body);

    articleArea.custom_fields = articleArea.custom_fields.map(a => {
      a = new CustomFieldModel(a);
      return a;
    });

    articleArea.custom_fields = JSON.stringify(articleArea.custom_fields);

    delete articleArea.id;

    let response = await PostTypeSchema.update(articleArea, { where: { id: id, system: 'ARTICLE' }});

    return res.send(new SuccessModel("PostType atualizado com sucesso."));
  } catch (err) {
    console.log('err', err);

    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(new ErrorModel(err && err.message ? err.message : "Não foi possível atualizar o PostType.", models));
  }

}


/**
 * @route GET /rest/public/posttype/
 * @group Post Type Public
 * @returns {Array<ArticleArea>} 200
 * @returns {Error.model} 401
 */
exports.listPublic = async (req, res, next) => {


  try {
    var response = await PostTypeSchema.findAll({ where: { system: 'ARTICLE', show_in_search: 1 } });

    response = response.map(a => {
      return new ArticleAreaModel(a);
    })

    return res.send(response);
  } catch (err) {
    console.log('err', err);
    return res.status(404).send(new ErrorModel("Área de artigos não encontrada."));
  }

}

/**
 * @route GET /rest/public/posttype/{slug}
 * @group Post Type Public
 * @param {string} slug.path
 * @returns {ArticleArea.model} 200
 * @returns {Error.model} 401
 */
exports.getPublic = async (req, res, next) => {

  const slug = req.params.slug;
  if(!slug) { return res.status(403).send(new ErrorModel()) }

  try {
    var response = await PostTypeSchema.findOne({ where: { system: 'ARTICLE', show_in_search: 1, slug: slug } });
    response = new ArticleAreaModel(response);
    return res.send(response);
  } catch (err) {
    console.log('err', err);
    return res.status(404).send(new ErrorModel("Área de artigos não encontrada."));
  }

}
