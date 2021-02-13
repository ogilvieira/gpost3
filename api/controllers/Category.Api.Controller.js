const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const TaxonomyModel = require('../../core/models/TaxonomyModel');
const { TaxonomySchema, Sequelize } = require('../../core/schemas');

/**
 * @route GET /api/categories/{posttypeID}
 * @group Category
 * @param {integer} posttypeID.path Posttype's id
 * @returns {Array<Taxonomy>} 200
 * @returns {Error.model} 401
 */
exports.getAll = async (req, res, next) => {

  const posttypeID = req.params.posttypeID;
  if(!posttypeID) { return res.status(403).send(new ErrorModel()) }

  let objQuery = { where: { system: 'ARTICLE', type: 'CATEGORY', parent: posttypeID } };

  try {
    var taxonomies = await TaxonomySchema.findAll(objQuery);
    taxonomies = taxonomies.map( a => {
      return new TaxonomyModel(a);
    });

    return res.send(taxonomies);
  } catch (err) {
    return res.status(404).send(new ErrorModel(err ? err : "Nenhuma categoria para este posttype."));
  }
}

/**
 * @route GET /api/category/{categoryID}
 * @group Category
 * @param {string} categoryID.path Category's id or slug
 * @param {integer} posttype.query Required if categoryID is a slug string
 * @returns {Array<Taxonomy>} 200
 * @returns {Error.model} 401
 */
exports.get = async (req, res, next) => {

  const categoryID = req.params.categoryID;
  if(!categoryID) { return res.status(403).send(new ErrorModel()) }

  let objQuery = { where: { system: 'ARTICLE', type: 'CATEGORY' } };

  if( isNaN(categoryID) ) {
    objQuery.where.slug = categoryID;

    if( !req.query.posttype || isNaN(req.query.posttype) ) {
      return res.status(403).send(new ErrorModel())
    }

    objQuery.where.parent = req.query.posttype;

  } else {
    objQuery.where.id = categoryID;
  }

  try {
    var taxonomy = await TaxonomySchema.findOne(objQuery);
    if(!taxonomy){ throw null; }

    return res.send(new TaxonomyModel(taxonomy));
  } catch (err) {
    return res.status(404).send(new ErrorModel(err ? err : "Nenhuma categoria para este posttype."));
  }
}
