exports.index = async (data, req, res, next) => {
  data.SITE.title = "Articles";
  return res.render('articles/articles', data);
}

exports.edit = async (data, req, res, next) => {
  data.SITE.title = "Edit";
  return res.render('articles/edit', data);
}

exports.categories = async (data, req, res, next) => {
  data.SITE.title = "Categories";
  return res.render('articles/categories', data);
}

exports.postNew = async (data, req, res, next) => {
  data.SITE.title = "Post";
  return res.render('articles/post', data);
}

exports.postEdit = async (data, req, res, next) => {
  data.SITE.title = "Post";
  return res.render('articles/post', data);
}
