const ErrorModel = require('../../core/models/ErrorModel');
const BannerModel = require('../../core/models/BannerModel');
const { BannerSchema, Sequelize } = require('../../core/schemas');

/**
 * @route GET /api/banner/{id}
 * @group Banner
 * @param {integer} id.path
 * @param {integer} limit.query
 * @returns {Array<Banner>} 200
 * @returns {Error.model} 401
 */
exports.get = async (req, res, next) => {

  const id = req.params.id;
  const limit = req.query.limit && !isNaN(req.query.limit) ? Number(req.query.limit) : 0;

  if(!id) { return res.status(403).send(new ErrorModel()) }

  const query = {
    attributes: ['image', 'title', 'link', 'order'],
    where: {
      category: id,
      image: {
        [Sequelize.Op.not]: null
      },
      start_date: {
        [Sequelize.Op.lte]: new Date()
      },
      end_date: {
        [Sequelize.Op.gte]: new Date()
      }
    },
    order: [['order','ASC']]
  }

  if( limit ) { query.limit = limit; }

  try {
    var banners = await BannerSchema.findAll(query);
    return res.send(banners);
  } catch (err) {
    console.log('err ',err);
    return res.status(404).send(new ErrorModel("Área de banner não encontrada."));
  }

}
