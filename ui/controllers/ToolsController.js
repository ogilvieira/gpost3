exports.backup = async (data, req, res, next) => {
  data.SITE.title = "Gerenciar Backups";
  return res.render('tools/backup', data);
}

exports.log = async (data, req, res, next) => {
  data.SITE.title = "Gerenciar Log";
  return res.render('tools/log', data);
}
