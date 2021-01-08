const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const TaxonomyModel = require('../../core/models/TaxonomyModel');
const ArticleAreaModel = require('../../core/models/ArticleAreaModel');
const { PostTypeSchema, Sequelize } = require('../../core/schemas');

/**
 * @route GET /rest/articles/{id}
 * @group Articles
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
