const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const TaxonomyModel = require('../../core/models/TaxonomyModel');
const { TaxonomySchema } = require('../../core/schemas');
const slugify = require('slugify')


/**
 * @route GET /rest/banner
 * @group Banner
 * @returns {Array<Taxonomy>} 200
 * @returns {Error.model} 401
 * @security JWT
 */
exports.getAll = async (data, req, res, next) => {

  try {
    const taxonomies = await TaxonomySchema.findAll({ where: {
      system: "BANNER"
    }});

    res.send(taxonomies);

  } catch (err) {
    res.status(500).send(new ErrorModel())
  }
}

/**
 * @route GET /rest/banner/{id}
 * @group Banner
 * @param {integer} id.path
 * @returns {Taxonomy.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.get = async (data, req, res, next) => {
  const id = req.params.id;

  if(!id) { return res.status(403).send(new ErrorModel()) }

  try {
    var bannerArea = await TaxonomySchema.findOne({ where: { id: id } });
    bannerArea = new TaxonomyModel(bannerArea);
    return res.send(bannerArea);
  } catch (err) {
    return res.status(404).send(new ErrorModel("Área de banner não encontrada."));
  }

}

/**
 * @route POST /rest/banner
 * @group Banner
 * @param {Taxonomy.model} data.body.required
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.add = async (data, req, res, next) => {
  
  const BannerArea = new TaxonomyModel({
    title: req.body.title,
    description: req.body.description || "",
    slug: slugify(req.body.title),
    system: "BANNER"
  });


  try {
    var banner = await TaxonomySchema.create(BannerArea);
    return res.send(new SuccessModel("Área de banner criada com sucesso.", new TaxonomyModel(banner)));
  } catch (err) {
    console.log(err);
    return res.status(403).send(new ErrorModel("Não foi possível cadastrar."));
  }

}
