exports.index = async (data, req, res, next) => {
  data.SITE.title = "Configurações";
  return res.render('config/config', data);
}
