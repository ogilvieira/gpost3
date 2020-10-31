const express = require("express");
const router = express.Router();

const Login = require('./controllers/LoginController.js');
const Home = require('./controllers/HomeController.js');

module.exports = (app) => {

  router.get('/', Home.index);
  router.get('/login', Login.index);

  // router.route("/")
  //   .get(Install.index)
  //   .post(Install.index);

  // router.get('*', (req, res) => {
  //   return res.redirect("/");
  // })

  return router;
};
