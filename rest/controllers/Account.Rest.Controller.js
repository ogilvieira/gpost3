const AuthModel = require('../../core/models/AuthModel');
const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const UserModel = require('../../core/models/UserModel');
const { UserSchema, LogSchema } = require('../../core/schemas');

/**
 * @route GET /rest/account
 * @group Account
 * @returns {User.model} 200
 * @returns {Error.model} 401
 * @security JWT
 */
exports.get = async (data, req, res, next) => {
  return res.status((!data.userData || data.userData instanceof ErrorModel ? 401 : 200)).send(data.userData);
}

/**
 * @route PUT /rest/account
 * @group Account
 * @param {User.model} data.body.required
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @security JWT
 */
exports.update = async (data, req, res, next) => {
  
  if( !data.userData || data.userData instanceof ErrorModel ) {
    return res.status(401).send(data.userData instanceof ErrorModel ? data.userData : new ErrorModel());
  }

  var user = req.body;
  user.active = data.userData.active;
  user.role = data.userData.role;
  user.id = data.userData.id;
  var userUpdated = null;

  try {
    userUpdated = await UserSchema.update(user, { where: { id: data.userData.id } })
    
    await LogSchema.create({ user: data.userData.id, action: 'UPDATE', target: user.id, type: 'USER' });

  } catch ( err ) {
    return res.status(500).send(new ErrorModel());
  }

  return res.status(userUpdated ? 200 : 500).send(userUpdated ? new SuccessModel("Usuário atualizado com sucesso.") : new ErrorModel());
}


/**
 * @typedef UserPassword
 * @property {string} currentPassword
 * @property {string} newPassword
 */


/**
 * @route PUT /rest/account/password
 * @group Account
 * @param {UserPassword.model} data.body.required
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @security JWT
 */
exports.updatePassword = async (data, req, res, next) => {

  if( !data.userData || data.userData instanceof ErrorModel ) {
    return res.status(401).send(data.userData instanceof ErrorModel ? data.userData : new ErrorModel());
  }

  if(!req.body.currentPassword || req.body.currentPassword.length < 6) {
    return res.status(403).send(new ErrorModel(null, {
      currentPassword: "Senha inválida"
    }));
  }

  if(!req.body.newPassword || req.body.newPassword.length < 6) {
    return res.status(403).send(new ErrorModel(null, {
      newPassword: "A nova senha precisa ter pelomenos 6 caracteres."
    }));
  }

  if(req.body.currentPassword == req.body.newPassword ) {
    return res.status(403).send(new ErrorModel(null, {
      newPassword: "A nova senha precisa ser diferente da atual."
    }));
  }


  var auth = new AuthModel(data.userData.email, req.body.currentPassword);
  var token = null;

  try {
    token = await auth.run();
  } catch (err) {
    if( err.models.password ) {
      err.models.currentPassword = err.models.password
      delete err.models.password;
    }
    return res.status(403).send(err);
  }

  var pass = auth.encryptPass(req.body.newPassword);

  var updatedPass = null;
  
  try {
   updatedPass = UserSchema.update({ password: pass }, { where: { id: data.userData.id }});
   await LogSchema.create({ user: data.userData.id, action: 'UPDATE', target: data.userData.id, type: 'USER' });
  } catch ( err ) {
    return res.status(500).send(new ErrorModel());
  }


  return res.status(updatedPass ? 200 : 500).send(updatedPass ? new SuccessModel("Senha atualizada com sucesso.") : new ErrorModel());
}


/**
 * @route POST /rest/account/login
 * @group Account
 * @param {Auth.model} data.body.required 
 * @returns {string} 200 - An jwt token
 * @returns {Error.model} 401
 */

exports.login = async (req, res) => {

  var auth = new AuthModel(req.body.email, req.body.password);

  try {
    let token = await auth.run();
    res.cookie('token', token);
    res.status(200).send(token);
  } catch(err) {
    res.status(401).send(err);
  }

}
