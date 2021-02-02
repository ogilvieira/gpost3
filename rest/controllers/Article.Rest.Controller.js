const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const ArticleModel = require('../../core/models/ArticleModel');
const CustomFieldModel = require('../../core/models/CustomFieldModel');
const { ArticleSchema, PostTypeSchema, Sequelize } = require('../../core/schemas');

/**
 * @route GET /rest/posttype/{id}/articles
 * @group Post Type
 * @param {integer} id.path
 * @returns {Array<Taxonomy>} 200
 * @returns {Error.model} 401
 * @tag private
 * @security JWT
 */
exports.getAll = async (data, req, res, next) => {

  const parentID = req.params.id;

  if(!parentID){ return next(); }

  var page = req.query.page || 1;
  var terms = req.query.terms || null;
  var paginate = req.query.paginate || 10;

  try {
    var articles = await ArticleSchema.findAll({ where: {
      parent: parentID
    }});

    articles = articles.map( a => {
      a.is_editing_by = a.is_editing_by == data.userData.id ? "" : a.is_editing_by;
      return new ArticleModel(a);
    })

    res.send(articles);

  } catch (err) {
    res.status(500).send(new ErrorModel())
  }
}


/**
 * @route POST /rest/article
 * @group Articles
 * @param {Article.model} data.body.required
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @returns {Error.model} 403
 * @security JWT
 */
exports.post = async (data, req, res, next) => {

  if(!req.body || !data.userData || typeof req.body != 'object'){ return next(); }

  try {

    req.body.author = data.userData.id;

    if( req.body.id ) { delete req.body.id; }

    var article = await ArticleSchema.create(new ArticleModel(req.body));
    delete article.updated_at;

    return res.send(new SuccessModel("Artigo criado com sucesso.", new ArticleModel(article)));
  } catch (err) {

    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(err instanceof ErrorModel ? err : new ErrorModel(err && err.message ? err.message : "Não foi possível cadastrar.", models));

  }

}


/**
 * @route PUT /rest/article/{id}
 * @group Articles
 * @param {Article.model} data.body.required
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @returns {Error.model} 403
 * @security JWT
 */
exports.update = async (data, req, res, next) => {

  if(!req.body || !data.userData || typeof req.body != 'object'){ return next(); }

  try {
    var id = req.body.id;

    var item = new ArticleModel(req.body);
    var originalItem = await ArticleSchema.findOne({ where: {
      id: id
    }});

    if( originalItem && originalItem.is_editing_by && originalItem.is_editing_by != data.userData.id) {
      return res.status(403).send(new ErrorModel("Este artigo esta sendo editado por outra pessoa neste momento."))
    }


    if( data.userData.role == 'editor' ){
      delete item.author;
    }

    let response = await ArticleSchema.update(item, { where: { id: id, parent: item.parent }});

    if(!response[0]){
      throw null;
    }

    return res.send(new SuccessModel("Item atualizado com sucesso."));
  } catch (err) {

    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(err instanceof ErrorModel ? err : new ErrorModel(err && err.message ? err.message : "Não foi possível cadastrar.", models));

  }

}



/**
 * @route GET /rest/article/{id}
 * @group Articles
 * @param {integer} id.path.required
 * @returns {Article.model} 200
 * @returns {Error.model} 401
 * @returns {Error.model} 403
 * @returns {Error.model} 404
 * @security JWT
 */
exports.get = async (data, req, res, next) => {

  const id = req.params.id;

  if(!id){ return next(); }

  try {
    var article = await ArticleSchema.findOne({ where: {
      id: id
    }});

    if(!article) {
      return res.status(404).send(new ErrorModel("Não Encontrado."))
    }

    article = new ArticleModel(article);
    res.send(article);

  } catch (err) {

    console.log(err);

    res.status(500).send(new ErrorModel())
  }
}
