const express = require("express");
const router = express.Router();

const Install = require("./controllers/Install.Controller");

module.exports = (app) => {

  router.route("/")
    .get(Install.index)
    .post(Install.index);

  router.get('*', (req, res) => {
    return res.redirect("/");
  })

  return router;
};
