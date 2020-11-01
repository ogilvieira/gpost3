exports.index = async (data, req, res, next) => {

  data.SITE.showNavBar = false;
  data.SITE.showTitleBar = false;
  data.SITE.title = "Login";

  res.render('login/login', data);
}
