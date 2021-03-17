const ErrorModel = require('./models/ErrorModel');
const SuccessModel = require('./models/SuccessModel');
const path = require('path');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');

exports.upload = async (files) => {
  if(!files || Object.keys(files).length === 0) { throw new ErrorModel("Arquivo ausente."); }

  var image = files.image || files.file;

  if(!image) {
    throw new ErrorModel("Não conseguimos receber o arquivo, tente novamente.");
  }

  if( image && image.truncated ) {
    throw new ErrorModel("O arquivo é grande demais.");
  }

  let d = new Date().getTime()+'';

  image.name = d.slice(-6)+'_'+image.name.replace(/[^.,a-zA-Z0-9]/g, '-').toLowerCase();


  if ( !(/\.(gif|jpg|jpeg|png)$/i).test(path.extname(image.name)) ) {
    throw new ErrorModel("Tipo de arquivo inválido.");
  }

  var file_path = path.join(__dirname, '../public/upload/'+image.name);
  var dir_path = path.join(__dirname, '../public/upload');


  if( !fs.existsSync(file_path) ) {

    if (!fs.existsSync(dir_path)){ fs.mkdirSync(dir_path); }

    try {
      image.mv(file_path);
    } catch (err) {
      throw new ErrorModel(err ? err : null);
    }


    try {

      var files = await imagemin([file_path], {
        destination: dir_path,
        plugins: [
          imageminJpegtran({ progressive: true }),
          imageminMozjpeg({
            quality: 90
          }),
          imageminPngquant({quality: [0.8, 0.9]})
        ]
      });

    } catch (err) {
      throw new ErrorModel("Erro ao tentar comprimir o arquivo.");
    }
  }


  return ((process.env.BASE_URL || '/')+'upload/'+image.name);

}

exports.findAndDelete = async ( filename ) => {
  if(!filename) { throw new ErrorModel("O nome do arquivo é requerido."); }


  if ( !(/\.(gif|jpg|jpeg|png)$/i).test(path.extname(filename)) ) {
    throw new ErrorModel("Tipo de arquivo inválido.");
  }

  filename = filename.split('\/').slice(-1)[0];

  const file_path = path.join(__dirname, '../public/upload/'+filename);

  if(!fs.existsSync(file_path)) {
    throw new ErrorModel("O arquivo não existe.");
  }

  fs.unlink(file_path, (err) => {
    if (err) {
      throw new ErrorModel();
    }
  });


  return new SuccessModel("Arquivo excluído com sucesso.");
}
