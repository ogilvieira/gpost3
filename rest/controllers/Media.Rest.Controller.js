const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const { ConfigSchema } = require('../../core/schemas');
const path = require('path');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');

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

  if( !data.userData || data.userData instanceof ErrorModel ) {
    return res.status(401).send(data.userData instanceof ErrorModel ? data.userData : new ErrorModel());
  }


  if(!req.files || Object.keys(req.files).length === 0) { return res.status(400).send(new ErrorModel("Arquivo ausente.") ); }

  var image = req.files.image || req.files.file;

  if(!image) {
    return res.status(500).send( new ErrorModel("Não conseguimos receber o arquivo, tente novamente."));
  }

  if( image && image.truncated ) {
    return res.status(403).send(new ErrorModel("O arquivo é grande demais."))
  }

  let d = new Date().getTime()+'';

  image.name = d.slice(-6)+'_'+image.name.replace(/[^.,a-zA-Z0-9]/g, '-').toLowerCase();


  if ( !(/\.(gif|jpg|jpeg|png)$/i).test(path.extname(image.name)) ) {
    return res.status(403).send(new ErrorModel("Tipo de arquivo inválido."));
  }

  var file_path = path.join(__dirname, '../../public/upload/'+image.name);
  var dir_path = path.join(__dirname, '../../public/upload');


  if( !fs.existsSync(file_path) ) {

    if (!fs.existsSync(dir_path)){ fs.mkdirSync(dir_path); }

    try {
      image.mv(file_path);
    } catch (err) {
      return res.status(500).send(new ErrorModel(err ? err : null));
    }


    try {

      var files = await imagemin([file_path], {
        destination: dir_path,
        plugins: [
          imageminJpegtran({ progressive: true }),
          imageminMozjpeg({
            quality: 70
          }),
          imageminPngquant({quality: [0.6, 0.8]})
        ]
      });
      
    } catch (err) {
      return res.status(500).send(new ErrorModel("Erro ao tentar comprimir o arquivo."));
    }


  }

  return res.send((process.env.SITE_BASE_URL || '/')+'upload/'+image.name);
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
