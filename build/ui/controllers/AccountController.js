exports.index = async (data, req, res, next) => {
  data.SITE.title = "Minha Conta";
  res.render('account/account', data);
}
