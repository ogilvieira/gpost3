const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const { ConfigSchema } = require('../../core/schemas');
const path = require('path');
const fs = require('fs');
const ImageManager = require('../../core/ImageManager');

/**
 * @route POST /rest/media
 * @group Media
 * @consumes multipart/form-data
 * @operationId uploadFile
 * @param {file} image.formData.required
 * @returns {string} 200
 * @returns {Error.model} 403
 * @security JWT
 */
exports.upload = async (data, req, res, next) => {
  try {
    const imagepath = await ImageManager.upload(req.files);
    return res.send(imagepath);
  } catch ( err ) {
    return res.status(500).send(err ? err : new ErrorModel());
  }
}


/**
 * @route DELETE /rest/media
 * @group Media
 * @param {string} filename.path
 * @returns {Success.model} 200
 * @returns {Error.model} 403
 * @security JWT
 */
exports.delete = async (data, req, res, next) => {

  if( !data.userData || data.userData instanceof ErrorModel ) {
    return res.status(401).send(data.userData instanceof ErrorModel ? data.userData : new ErrorModel());
  }

  if(!req.params.filename) { res.status(403).send(new ErrorModel("O nome do arquivo é requerido."))}

  if ( !(/\.(gif|jpg|jpeg|png)$/i).test(path.extname(req.params.filename)) ) {
    return res.status(403).send(new ErrorModel("Tipo de arquivo inválido."));
  }

  var file_path = path.join(__dirname, '../../public/upload/'+req.params.filename);

  if(!fs.existsSync(file_path)) {
    return res.status(404).send(new ErrorModel("O arquivo não existe."))
  }


  fs.unlink(file_path, (err) => {
    if (err) {
      return res.status(500).send(new ErrorModel());
    }
  });

  return res.send(new SuccessModel("Arquivo excluído com sucesso."))

}
