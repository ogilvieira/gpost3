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
