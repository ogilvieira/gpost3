const { ConfigSchema } = require("../../core/schemas.js");
const AuthModel = require("../../core/models/AuthModel.js");

require("dotenv").config();

exports.index = async (req, res, next) => {
  var data = {};

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
    config: {},
    breadcrumbs: [
      {
        name: "Home",
        path: "/",
      },
    ]
  };

  data.user = null;

  let configs = await ConfigSchema.findAll({'atributes' : ['key_value','key_slug']});

  Object.values(configs).map(a => {
    data.SITE.config[a.key_slug] = a.key_value;
  });

  data.SITE.sitename = data.SITE.config.sitename;

  return next(data);

}
