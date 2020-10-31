const express = require("express");
const router = express.Router();

const Install = require("./controllers/Install.Controller");

module.exports = (app) => {

  router.get("/", Install.index);
  router.post("/", Install.post);

  router.get('*', (req, res) => {
    return res.redirect("/");
  })

  return router;
};
