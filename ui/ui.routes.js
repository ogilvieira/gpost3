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
const AuthGuard = require("../core/AuthGuard");

module.exports = (app) => {

  router.get('/login', (req, res, next) => {
    if( req.cookies.token ) {
      return res.redirect('/');
    }

    return next({});
  }, Base.index, Login.index);

  router.get('/', AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Home.index);
  router.get('/account', AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Account.index);

  router.get('/users', AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Users.index);
  router.get('/users/new', AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Users.add);
  router.get('/users/:id', AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Users.edit);

  router.get('/banners', AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Banners.index);
  router.get('/banners/new', AuthGuard.checkAuthorization, AuthGuard.checkToBlock, AuthGuard.checkAdmin, Base.index, Banners.add);
  router.get('/banners/:id', AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Banners.edit);
  router.get('/banners/:id/items', AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Banners.detail);

  router.get("/posttype/:posttypeID/edit", AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Articles.editPosttype);
  router.get("/articles/:posttypeID/", AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Articles.index);
  router.get("/articles/:posttypeID/categories", AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Articles.categories);
  router.get("/articles/:posttypeID/featured", AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Articles.featured);
  router.get("/articles/:posttypeID/:id", AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Articles.postEdit);

  router.get('/config', AuthGuard.checkAuthorization, AuthGuard.checkToBlock, Base.index, Config.index)

  router.get('/api-docs', AuthGuard.checkAuthorization, AuthGuard.checkToBlock, (data, req, res, next) => {
    return data.userData.role == 'dev' ? next() : res.redirect('/');
  })

  router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
  })

  return router;
};
