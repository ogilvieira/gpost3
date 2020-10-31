const express = require('express');
const router = express.Router();

var Auth = require("./controllers/Auth.Rest.Controller");
// var User = require("./controllers/User.Admin.Controller");
// var Account = require("./controllers/Account.Admin.Controller");
// var Pages = require("./controllers/Pages.Admin.Controller");
// var PostType = require("./controllers/PostType.Admin.Controller");
// var Posts = require("./controllers/Posts.Admin.Controller");
// var Site = require("./controllers/Site.Admin.Controller");
// var Media = require("./controllers/Media.Admin.Controller");
// var Forms = require("./controllers/Forms.Admin.Controller");
// var Custom = require("./controllers/Custom.Admin.Controller");
// var Taxonomy = require("./controllers/Taxonomy.Admin.Controller");
// var Relationship = require("./controllers/Relationship.Admin.Controller");
// var Banners = require("./controllers/Banners.Admin.Controller");

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
  return (data.user.role != 'admin' && data.user.role != 'dev') ? res.status(401).send("Permission denied.") : next(data);
}

module.exports = (app) => {
  
  router.get('/', (req, res) => {
    res.status(200).send({});
  });

  router.post('/login', Auth.index);
  // router.get('/logout', Auth.logout);

  //User
  // router.route('/user')
  //   .get(Auth.checkToken, User.index)
  //   .post(Auth.checkToken, checkAdmin, User.post);

  // router.route('/user/:id')
  //   .get(Auth.checkToken, checkAdmin, User.get)
  //   .put(Auth.checkToken, checkAdmin, User.put)
  //   .delete(Auth.checkToken, checkAdmin, User.delete);

  return router;
};
