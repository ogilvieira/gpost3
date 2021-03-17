const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const UserModel = require('../../core/models/UserModel');
const LogModel = require('../../core/models/LogModel');
const { LogSchema, UserSchema, Sequelize } = require('../../core/schemas');

/**
 * @route GET /rest/log/
 * @group Log
 * @param {string} type.query.required
 * @param {integer} target.query.required
 * @param {integer} paginate.query
 * @param {integer} page.query
 * @returns {Array<Log>} 200
 * @returns {Error.model} 401
 * @tag private
 * @security JWT
 */
exports.index = async (data, req, res, next) => {
  const type = req.query.type || null;
  const target = req.query.target && !isNaN(req.query.target) ? Number(req.query.target) : null;
  const page = req.query.page && !isNaN(req.query.page) ? Number(req.query.page) : 1;
  const paginate = req.query.paginate && !isNaN(req.query.paginate) ? Number(req.query.paginate) : 30;

  try {

    let users = await UserSchema.findAll();

    if( users && users.length ) {
      users = users.map( a => new UserModel(a) );
    }

    let logsData = await LogSchema.paginate({
      page: page,
      paginate: paginate,
      where: { 
        type: type, 
        target: target 
      },
      order: [['id', 'DESC']]
    });


    if( logsData && logsData.docs ) {
      logsData.docs = logsData.docs.map( a => {
        a.user = users.find( user => user.id == a.user);
        return new LogModel(a);
      });
    }

    res.send(logsData);

  } catch (err) {
    console.log(err);
    res.status(500).send(new ErrorModel())
  }
}
