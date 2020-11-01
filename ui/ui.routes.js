const express = require("express");
const router = express.Router();

const Base = require('./controllers/BaseController.js');
const Login = require('./controllers/LoginController.js');
const Home = require('./controllers/HomeController.js');
const Account = require('./controllers/AccountController.js');
const Banners = require('./controllers/BannersController.js');
const Users = require('./controllers/UsersController.js');
const Config = require('./controllers/ConfigController.js');
const Articles = require('./controllers/ArticlesController.js');

module.exports = (app) => {

  router.get('/login', Base.index, Login.index);

  router.get('/', Base.index, Home.index);
  router.get('/account', Base.index, Account.index);

  router.get('/users', Base.index, Users.index);
  router.get('/users/new', Base.index, Users.add);
  router.get('/users/:id', Base.index, Users.edit);

  router.get('/banners', Base.index, Banners.index);
  router.get('/banners/new', Base.index, Banners.add);
  router.get('/banners/:id', Base.index, Banners.edit);
  router.get('/banners/:id/items', Base.index, Banners.detail);


  router.get("/articles/:posttype/", Base.index, Articles.index);
  router.get("/articles/:posttype/edit", Base.index, Articles.edit);
  router.get("/articles/:posttype/categories", Base.index, Articles.categories);
  router.get("/articles/:posttype/new", Base.index, Articles.postNew);
  router.get("/articles/:posttype/:post", Base.index, Articles.postEdit);

  router.get('/config', Base.index, Config.index)

  return router;
};
