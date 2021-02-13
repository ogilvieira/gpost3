const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const ArticleAreaModel = require('../../core/models/ArticleAreaModel');
const { PostTypeSchema, Sequelize } = require('../../core/schemas');

/**
 * @route GET /api/posttype/
 * @group Post Type
 * @returns {Array<ArticleArea>} 200
 * @returns {Error.model} 401
 */
exports.getAll = async (req, res, next) => {

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
 * @route GET /api/posttype/{posttypeID}
 * @group Post Type
 * @param {string} posttypeID.path Posttype's slug or id
 * @returns {ArticleArea.model} 200
 * @returns {Error.model} 401
 */
exports.get = async (req, res, next) => {

  const posttypeID = req.params.posttypeID;
  if(!posttypeID) { return res.status(403).send(new ErrorModel()) }

  try {
    let objQuery = { where: { system: 'ARTICLE', show_in_search: 1 } };


    objQuery.where[isNaN(posttypeID) ? 'slug' : 'id'] = posttypeID;
    var response = await PostTypeSchema.findOne(objQuery);
    response = new ArticleAreaModel(response);
    return res.send(response);
  } catch (err) {
    return res.status(404).send(new ErrorModel("Área de artigos não encontrada."));
  }

}
