const AuthModel = require('../../core/models/AuthModel');


/**
 * This function comment is parsed by doctrine
 * @route POST /login
 * @group Auth - Operations about user
 * @param {string} email.body.required - username or email - eg: user@domain
 * @param {string} password.body.required - user's password.
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 */

exports.index = async (req, res) => {
  var auth = new AuthModel(req.body.email, req.body.password);

  auth.run().then( auth => {
    return res.status(200).send(auth);
  }); 

}


exports.logout = (req, res) => {
  return res.status(200).send("logout");
}


exports.checkToken = async (req, res, next) => {
  var token = req.headers['x-access-token'] || req.body.token || req.query.token;
 
  var authModel = new AuthModel();

  var auth = await authModel.checkToken(token);

  if(!auth) return res.status(401).send("Invalid token.");
  
  if( req.body.hasOwnProperty('token') ) { delete req.body.token; }
  if( req.query.hasOwnProperty('token') ) { delete req.query.token; }

  return next(auth);
}
