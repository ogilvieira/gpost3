const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const TaxonomyModel = require('../../core/models/TaxonomyModel');
const { TaxonomySchema, BannerSchema, Sequelize } = require('../../core/schemas');
const ImageManager = require('../../core/ImageManager');


/**
 * @route GET /rest/posttype/{id}/categories
 * @group Articles
 * @param {integer} id.path
 * @returns {Array<Taxonomy>} 200
 * @returns {Error.model} 401
 * @security JWT
 */
exports.getAll = async (data, req, res, next) => {

  const id = req.params.id;

  if(!id){ return next(); }

  try {
    var taxonomies = await TaxonomySchema.findAll({ where: {
      system: "ARTICLE",
      type: "CATEGORY",
      parent: id
    }});

    taxonomies = taxonomies.map( a => {
      return new TaxonomyModel(a);
    })

    res.send(taxonomies);

  } catch (err) {
    res.status(500).send(new ErrorModel())
  }
}


/**
 * @route GET /rest/category/{id}
 * @group Category
 * @param {integer} id.path
 * @returns {Taxonomy} 200
 * @returns {Error.model} 401
 * @security JWT
 */
exports.get = async (data, req, res, next) => {

  const id = req.params.id;

  if(!id){ return next(); }

  try {
    var category = await TaxonomySchema.findOne({ where: {
      id: id,
      system: "ARTICLE",
      type: "CATEGORY",
    }});

    category = new TaxonomyModel(category);
    res.send(category);

  } catch (err) {
    res.status(500).send(new ErrorModel())
  }
}

/**
 * @route PUT /rest/category/{id}
 * @group Category
 * @param {integer} id.path
 * @returns {Taxonomy} 200
 * @returns {Error.model} 401
 * @security JWT
 */
exports.get = async (data, req, res, next) => {

  const id = req.params.id;

  if(!id){ return next(); }

  try {
    var category = await TaxonomySchema.findOne({ where: {
      id: id,
      system: "ARTICLE",
      type: "CATEGORY",
    }});

    category = new TaxonomyModel(category);
    res.send(category);

  } catch (err) {
    res.status(500).send(new ErrorModel())
  }
}


/**
 * @route POST /rest/posttype/{id}/categories
 * @group Articles
 * @param {integer} id.path
 * @param {String} title.query
 * @param {String} description.query
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @returns {Error.model} 403
 * @security JWT
 */
exports.post = async (data, req, res, next) => {

  const id = Number(req.params.id);

  if(!id){ return next(); }

  if(!req.query.title || req.query.title.length < 3) {
    res.status(403).send(new ErrorModel("Titulo precisa ter pelo menos 3 caracteres.", "title"))
  }

  if(req.query.description && req.query.description.length > 120) {
    res.status(403).send(new ErrorModel("Descrição precisa ter no máximo 120 caracteres.", "title"))
  }

  let item = new TaxonomyModel({
    title: req.query.title || "",
    description: req.query.description || "",
    system: "ARTICLE",
    type: "CATEGORY",
    parent: id
  });

  try {
    var category = await TaxonomySchema.create(item);
    return res.send(new SuccessModel("Categoria criada com sucesso.", new TaxonomyModel(category)));
  } catch (err) {
    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(new ErrorModel(err && err.message ? err.message : "Não foi possível cadastrar.", models));
  }
}

