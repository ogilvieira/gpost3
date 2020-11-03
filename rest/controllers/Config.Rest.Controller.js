const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const ConfigModel = require('../../core/models/ConfigModel');
const { ConfigSchema } = require('../../core/schemas');
/**
 * @route GET /rest/config
 * @group Config
 * @returns {Array<Config>} 200
 * @returns {Error.model} 500
 */
exports.getAll = async (req, res) => {

  try {
    await ConfigSchema.findAll({ order: [['id', 'ASC']]})
    .then(response => {     
      res.send(response);
    });
  } catch ( err ) {
    res.status(500).send(new ErrorModel());
  }

}

/**
 * @route PUT /rest/config
 * @group Config
 * @param {integer} id.path
 * @param {Config.model} data.body.required
 * @returns {Success.model} 200
 * @returns {Error.model} 403
 * @returns {Error.model} 500
 * @security JWT
 */
exports.update = async (data, req, res, next) => {

  if( !data.userData || data.userData instanceof ErrorModel ) {
    return res.status(403).send(data.userData instanceof ErrorModel ? data.userData : new ErrorModel());
  }

  if(!req.body || !req.params.id) {
    return res.status(403).send(new ErrorModel());
  }

  var config = new ConfigModel(req.body);
  delete config.id;
  delete config.key_type;
  delete config.key_slug;

  try {
    await ConfigSchema.update(config, { where: { id: req.params.id }});
    return res.send(new SuccessModel("Configuração atualizado com sucesso."));
  } catch (err) {
    
    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(new ErrorModel(err && err.message ? err.message : "Não foi possível atualizar a configuração.", models));
  }

}
