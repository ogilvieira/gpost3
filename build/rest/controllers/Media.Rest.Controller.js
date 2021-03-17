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

  try {
    var msg = ImageManager.findAndDelete(req.params.filename);
    return res.send(msg);
  } catch (err) {
    return res.status(403).send(err);
  }

}
