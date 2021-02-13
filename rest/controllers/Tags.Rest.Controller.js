const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const { AssociationSchema, PostTypeSchema, Sequelize } = require('../../core/schemas');

/**
 * @route GET /rest/tags/
 * @group Tags
 * @returns {Array<Taxonomy>} 200
 * @returns {Error.model} 401
 * @tag private
 * @security JWT
 */
exports.getAll = async (data, req, res, next) => {

  try {

    let tags = await AssociationSchema.findAll({
      where: { type: 'TAG' },
      attributes: ['value']
    });

    let tagsData = [];

    tags.map(a => {
      let elIndex = tagsData.findIndex(b => {
        return b.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() == a.value.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()
      } );

      if( elIndex == -1 ){
        tagsData.push({ 'name': a.value, count: 1 })
      } else {
        tagsData[elIndex].count++;
      }
    });

    tagsData = tagsData.sort((a,b) => b.count - a.count );

    res.send(tagsData);

  } catch (err) {
    console.log(err);
    res.status(500).send(new ErrorModel())
  }
}
