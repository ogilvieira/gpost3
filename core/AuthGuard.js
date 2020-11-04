const jwt = require('jsonwebtoken');
const { UserSchema } = require('./schemas');
const UserModel = require('./models/UserModel');
const ErrorModel = require('./models/ErrorModel');

exports.checkAdmin = (data, req, res, next) => {
  if( !data.userData || data.userData instanceof ErrorModel ) {
    return res.status(401).send(data.userData instanceof ErrorModel ? data.userData : new ErrorModel());
  }

  if (data.userData.role != 'admin' && data.userData.role != 'dev') {
    return req.path.startsWith('/rest') ? res.status(403).send(new ErrorModel("Usuário sem permissão de acesso.")) : res.redirect("/");
  } else {
    return next(data);
  }

}

exports.checkAuthorization = async (req, res, next) => {
  var data = {};

  const token = req.get('Authorization') || req.cookies.token || null;

  if( !token ) {
    return next(data);
  }

  var jwtCheck = null;

  try {
    jwtCheck = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    data.userData = new ErrorModel("Token expirado.");
    return next(data);
  }

  data.userData = await UserSchema.findOne({ where: { id: jwtCheck.id } });

  if(!data.userData){
    data.userData = new ErrorModel("Usuário não encontrado.");
    return next(data);
  }

  data.userData = new UserModel(data.userData);

  if( !data.userData.active ) {
    return req.path.startsWith('/rest') ? res.end(new ErrorModel("Usuário sem permissão de acesso.")).status(401) : res.redirect('/login');
  }


  return next(data);
}

exports.checkToBlock = (data, req, res, next) => {


  if( !data.userData || data.userData instanceof ErrorModel ) {

    res.clearCookie('token');

    if( req.originalUrl.startsWith('/rest') ) {
      return res.status(401).send(data.userData instanceof ErrorModel ? data.userData : new ErrorModel());
    } else {
      return res.redirect(req.path == "/" ? "/login" : "/login?returnPath="+req.path);
    }
  }

  return next(data);
}
