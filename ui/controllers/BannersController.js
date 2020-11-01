exports.index = async (data, req, res, next) => {
  data.SITE.title = "Banners";
  res.render('banners/banners', data);
}

exports.edit = async (data, req, res, next) => {
  data.SITE.title = "Editar área de banners";
  data.areaID = req.params.id;
  return res.render('banners/banners-edit', data);
}

exports.add = async (data, req, res, next) => {
  data.SITE.title = "Nova área de banners";
  data.areaID = "";
  return res.render('banners/banners-edit', data);
}

exports.detail = async (data, req, res, next) => {
  data.SITE.title = "Itens do banner";
  data.areaID = "";
  return res.render('banners/banners-items', data);
}
