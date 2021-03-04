const { ConfigSchema, PostTypeSchema } = require("../../core/schemas.js");
const AuthModel = require("../../core/models/AuthModel.js");
const UserModel = require("../../core/models/UserModel.js");

require("dotenv").config();

exports.index = async (data, req, res, next) => {
  var data = data || {};
      data.userData = data.userData ? new UserModel(data.userData) : null;

  data.SITE = {
    sitename: "GPost",
    title: null,
    description: null,
    showTitleBar: true,
    base_url: res.locals.BASE_URL,
    showNavBar: true,
    isDev: process.env.NODE_ENV == "development",
    bodyClasslist: [],
    pageActive: null,
    subPageActive: null,
    articlesAreas: null,
    config: {},
    breadcrumbs: [
      {
        name: "Home",
        path: "/",
      },
    ]
  };

  let configs = await ConfigSchema.findAll({'atributes' : ['key_value','key_slug']});
  let articlesAreas = await PostTypeSchema.findAll({ where: {'system' : 'ARTICLE'}, 'atributes' : ['title','id']});
  data.SITE.articlesAreas = articlesAreas;

  Object.values(configs).map(a => {
    data.SITE.config[a.key_slug] = a.key_value;
  });

  data.SITE.sitename = data.SITE.config.sitename;

  return next(data);

}
