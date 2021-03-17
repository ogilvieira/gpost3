exports.index = async (data, req, res, next) => {
  data.SITE.title = "Usuários";
  return res.render('users/users', data);
}

exports.edit = async (data, req, res, next) => {
  data.SITE.title = "Editar usuário";
  data.userId = req.params.id;
  return res.render('users/users-edit', data);
}

exports.add = async (data, req, res, next) => {
  data.SITE.title = "Novo usuário";
  data.userId = "";
  return res.render('users/users-edit', data);
}
