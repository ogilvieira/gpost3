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

const Banner = require("./controllers/Banner.Api.Controller");
const PostType = require("./controllers/PostType.Api.Controller");
const Article = require("./controllers/Article.Api.Controller");
const Category = require("./controllers/Category.Api.Controller");

module.exports = (app) => {

  router.get('/', (req, res) => {
    res.status(200).send({});
  });

  //PUBLIC
  router.route("/banner/:id")
    .get(Banner.get);

  router.get("/posttype", PostType.getAll);
  router.get("/posttype/:posttypeID", PostType.get);

  router.get("/articles", Article.getAll);
  router.get("/article/:articleID", Article.get);

  router.get("/categories/:posttypeID", Category.getAll);
  router.get("/category/:categoryID", Category.get);

  return router;
};
