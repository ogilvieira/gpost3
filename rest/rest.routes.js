const express = require('express');
const router = express.Router();

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

const AuthGuard = require("../core/AuthGuard");
const Account = require("./controllers/Account.Rest.Controller");
const User = require("./controllers/User.Rest.Controller");
const Config = require("./controllers/Config.Rest.Controller");
const Media = require("./controllers/Media.Rest.Controller");
const Banner = require("./controllers/Banner.Rest.Controller");
const PostType = require("./controllers/PostType.Rest.Controller");
const Category = require("./controllers/Category.Rest.Controller");
const Article = require("./controllers/Article.Rest.Controller");
const Tags = require("./controllers/Tags.Rest.Controller");


module.exports = (app) => {

  router.get('/', (req, res) => {
    res.status(200).send({});
  });


  router.route("/account")
    .get(AuthGuard.checkAuthorization, Account.get)
    .put(AuthGuard.checkAuthorization, Account.update);

  router.put('/account/password', AuthGuard.checkAuthorization, Account.updatePassword);
  router.post('/account/login', Account.login);

  router.route("/user")
    .get(AuthGuard.checkAuthorization, User.getAll)
    .post(AuthGuard.checkAuthorization, AuthGuard.checkAdmin, User.add);

  router.route("/user/:id")
    .get(AuthGuard.checkAuthorization, AuthGuard.checkAdmin, User.get)
    .put(AuthGuard.checkAuthorization, AuthGuard.checkAdmin, User.update)

  router.route("/config")
    .get(Config.getAll);

  router.route("/config/:id")
    .put(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, AuthGuard.checkAdmin, Config.update);

  router.post("/media", AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Media.upload)
  router.delete("/media/:filename", AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Media.delete)

  router.get("/banner", AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Banner.getAll)
  router.post("/banner", AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Banner.add)

  router.route("/banner/:id")
    .get(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Banner.get)
    .put(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, AuthGuard.checkAdmin, Banner.update)

  router.route("/banner/:id/items")
    .get(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Banner.getItems)

  router.route("/banner/:id/item/:itemID")
    .put(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Banner.updateItem)
    .delete(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Banner.deleteItem)

  router.route("/banner/:id/item/new")
    .post(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Banner.addItem)

  router.route("/posttype/:id")
    .get(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, AuthGuard.checkAdmin, PostType.get)
    .put(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, AuthGuard.checkAdmin, PostType.update)

  router.route("/posttype/:id/categories")
    .get(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Category.getAll)


  //Category
  router.route("/category")
    .post(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Category.post);

  router.route("/category/:id")
    .get(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Category.get)
    .put(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Category.update);

  //Article
  router.route("/articles/posttype/:id")
    .get(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Article.getAll)

  router.route("/article/:id?")
    .post(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Article.post)
    .get(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Article.get)
    .put(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Article.update)


  router.put("/article/:id/lock", AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Article.lock)
  router.put("/article/:id/unlock", AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Article.unlock)

  //Article
  router.route("/tags")
    .get(AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Tags.getAll)

  return router;
};
