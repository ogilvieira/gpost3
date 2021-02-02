exports.index = async (data, req, res, next) => {
  data.SITE.title = "Posts";
  return res.render('articles/post-list', data);
}

exports.editPosttype = async (data, req, res, next) => {
  data.SITE.title = "Configurar Post Type";
  return res.render('articles/posttype-edit', data);
}

exports.categories = async (data, req, res, next) => {
  data.SITE.title = "Categories";
  return res.render('articles/categories', data);
}

exports.postEdit = async (data, req, res, next) => {
  data.posttype = req.params.posttypeID;
  data.ID = req.params.id;
  data.SITE.title = data.ID == 'new' ? "Novo Post" : "Editar Post";
  return res.render('articles/post-editor', data);
}
