exports.index = async (data, req, res, next) => {
  data.SITE.title = "Posts";
  return res.render('articles/articles', data);
}

exports.editPosttype = async (data, req, res, next) => {
  data.SITE.title = "Configurar Post Type";
  return res.render('articles/posttype-edit', data);
}

exports.categories = async (data, req, res, next) => {
  data.SITE.title = "Categories";
  return res.render('articles/categories', data);
}

exports.postNew = async (data, req, res, next) => {
  data.SITE.title = "Novo Post";
  data.posttype = req.params.posttypeID;
  data.ID = "new";
  return res.render('articles/post', data);
}

exports.postEdit = async (data, req, res, next) => {
  data.SITE.title = "Editar Post";
  data.posttype = req.params.posttypeID;
  data.ID = "new";
  return res.render('articles/post', data);
}
