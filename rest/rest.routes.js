const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { UserSchema } = require('../core/schemas');
const UserModel = require('../core/models/UserModel');
const ErrorModel = require('../core/models/ErrorModel');

const mcache = require('memory-cache');
var cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}

var checkAdmin = (data, req, res, next) => {
  if( !data.userData || data.userData instanceof ErrorModel ) {
    return res.status(401).send(data.userData instanceof ErrorModel ? data.userData : new ErrorModel());
  }
  return (data.userData.role != 'admin' && data.userData.role != 'dev') ? res.status(403).send(new ErrorModel("Usuário sem permissão de acesso.")) : next(data);
}

const checkAuthorization = async (req, res, next) => {
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
    return res.end(new ErrorModel("Usuário sem permissão de acesso.")).status(401);
  }


  return next(data);
}


const Account = require("./controllers/Account.Rest.Controller");
const User = require("./controllers/User.Rest.Controller");
const Config = require("./controllers/Config.Rest.Controller");
const Media = require("./controllers/Media.Rest.Controller");
const Banner = require("./controllers/Banner.Rest.Controller");


module.exports = (app) => {
  
  router.get('/', (req, res) => {
    res.status(200).send({});
  });


  router.route("/account")
    .get(checkAuthorization, Account.get)
    .put(checkAuthorization, Account.update);

  router.put('/account/password', checkAuthorization, Account.updatePassword);
  router.post('/account/login', Account.login);

  router.route("/user")
    .get(checkAuthorization, User.getAll)
    .post(checkAuthorization, checkAdmin, User.add);

  router.route("/user/:id")
    .get(checkAuthorization, checkAdmin, User.get)
    .put(checkAuthorization, checkAdmin, User.update)

  router.route("/config")
    .get(Config.getAll);

  router.route("/config/:id")
    .put(checkAuthorization, checkAdmin, Config.update);

  router.post("/media", checkAuthorization, Media.upload)
  router.delete("/media/:filename", checkAuthorization, Media.delete)

  router.get("/banner", checkAuthorization, Banner.getAll)
  router.post("/banner", checkAuthorization, Banner.add)

  router.route("/banner/:id")
    .get(checkAuthorization, checkAdmin, Banner.get)
    // .put(checkAuthorization, checkAdmin, User.update)

  return router;
};
