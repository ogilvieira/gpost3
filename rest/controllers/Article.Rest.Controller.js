const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const ArticleModelRaw = require('../../core/models/ArticleModelRaw');
const ArticleModel = require('../../core/models/ArticleModel');
const CustomFieldModel = require('../../core/models/CustomFieldModel');
const { ArticleSchema, AssociationSchema, PostTypeSchema, Sequelize, LogSchema } = require('../../core/schemas');
const ImageManager = require('../../core/ImageManager');
const ArticleQueryModel = require('../../core/models/ArticleQueryModel');

/**
 * @route GET /rest/articles/posttype/{id}
 * @group Post Type
 * @param {integer} id.path
 * @param {integer} posttype.query
 * @param {integer} paginate.query
 * @param {integer} page.query
 * @param {integer} category.query
 * @param {integer} author.query
 * @param {string} terms.query
 * @returns {Array<Article>} 200
 * @returns {Error.model} 401
 * @security JWT
 */
exports.getAll = async (data, req, res, next) => {
  const posttypeID = req.params.id;
  const page = Number(req.query.page) || 1;
  const terms = req.query.terms || null;
  const category = req.query.category || null;
  const author = req.query.author || null;
  const custom_fields = req.query.custom_fields || null;
  const except = req.query.except || null;
  const paginate = req.query.paginate || 10;
  const status = req.query.status ? Number(req.query.paginate) : null;
  const tag = req.query.tag || null;
  const archived = req.query.archived && req.query.archived == 1;

  //validate posttype
  const posttypeList = await PostTypeSchema.findAll({ where: { system: "ARTICLE" } });
  if(!posttypeList || (posttypeID && !posttypeList.find(a => a.id == posttypeID))){
    return res.status(404).send(new ErrorModel(posttypeID ? "PostType selecionado não existe ou não é público." : "Não há PostTypes públicos."));
  }

  let articleQuery = new ArticleQueryModel({
    posttypeID: posttypeID,
    page: page,
    terms: terms,
    category: category,
    tag: tag,
    custom_fields: custom_fields,
    except: except,
    paginate: paginate,
    status: status,
    author: author,
    archived: archived
  });

  try {
    var objQuery = await articleQuery.Generate();

    if(!objQuery) { throw "Erro ao tentar criar query."; }

    var response = await ArticleSchema[paginate ? 'paginate' : 'findAll' ](objQuery);

    if( paginate ) {
      response.docs = await Promise.all(response.docs.map(async (a) => {
        a = new ArticleModel(a).Populate();
        return a;
      }));
    } else {
      response = await Promise.all(response.map(async (a) => {
        a = new ArticleModel(a).Populate();
        return a;
      }));
    }

    res.send(response);

  } catch (err) {
    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(err instanceof ErrorModel ? err : new ErrorModel(err && err.message ? err.message : "Operação Inválida.", models));
  }
}

/**
 * @route POST /rest/article
 * @group Articles
 * @param {ArticleRaw.model} data.body.required
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
    req.body.is_editing_by = "";

    let item = new ArticleModelRaw(req.body);

    var article = await ArticleSchema.create(item);
    delete article.updated_at;



    let associations = [];

    item.tags.map(a => {
      associations.push({ target: article.id, value: a, type: "TAG", key: "tag" })
    });

    Object.keys(item.custom_fields).map(a => {
      if( item.custom_fields[a].length ) {
        associations.push({ target: article.id, value: item.custom_fields[a], type: "ARTICLE_CUSTOM_FIELD", key: a })
      }
    });

    if( associations ) {
      await AssociationSchema.bulkCreate(associations);
    }

    article.custom_fields = item.custom_fields;
    article.tags = item.tags;

    await LogSchema.create({ user: data.userData.id, action: 'CREATE', target: article.id, type: 'ARTICLE' });

    return res.send(new SuccessModel("Artigo criado com sucesso.", new ArticleModelRaw(article)));
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

  var id = req.body.id;

  var item = new ArticleModelRaw(req.body);
  item.is_editing_by = "";

  var originalItem = await ArticleSchema.findOne({ where: {
    id: id
  }});


  if(!originalItem){
    return next();
  }

  //delete image if is different from original
  if( originalItem.cover && originalItem.cover != req.body.cover ) {
    try {
      var imageDeleted = await ImageManager.findAndDelete(originalItem.cover);
    } catch (err) {
      console.log(err);
    }
  }

  try {

    if( originalItem && originalItem.is_editing_by && originalItem.is_editing_by != data.userData.id) {
      return res.status(403).send(new ErrorModel("Este artigo esta sendo editado por outra pessoa neste momento."))
    }

    if( originalItem && originalItem.is_editing_by && originalItem.is_editing_by == data.userData.id) {
      item.is_editing_by = "";
    }


    if( data.userData.role == 'editor' ){
      delete item.author;
    }

    let response = await ArticleSchema.update(item, { where: { id: id, parent: item.parent }});
    if(!response[0]){
      throw null;
    }


    await AssociationSchema.destroy({
      where: {
        target: id,
        type: {
          [Sequelize.Op.or] : ["TAG", "ARTICLE_CUSTOM_FIELD"]
        }
      }
    });

    let associations = [];

    item.tags.map(a => {
      associations.push({ target: id, value: a, type: "TAG", key: "tag" })
    });

    Object.keys(item.custom_fields).map(a => {
      if( item.custom_fields[a].length ) {
        associations.push({ target: id, value: item.custom_fields[a], type: "ARTICLE_CUSTOM_FIELD", key: a })
      }
    });


    if( associations ) {
      await AssociationSchema.bulkCreate(associations);
    }

    await LogSchema.create({ user: data.userData.id, action: 'UPDATE', target: originalItem.id, type: 'ARTICLE' });

    return res.send(new SuccessModel("Item atualizado com sucesso."));
  } catch (err) {

    console.log('err ', err)

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

    article = await new Promise(async (resolve, reject) => {

      let tags = await AssociationSchema.findAll({
        where: { type: 'TAG', target: article.id },
        attributes: ['value']
      });

      article.tags = [];
      tags.map(tag => article.tags.push(tag.value));

      let custom_fields = await AssociationSchema.findAll({
        where: { type: 'ARTICLE_CUSTOM_FIELD', target: article.id },
        attributes: ['key','value']
      });

      article.custom_fields = {};

      custom_fields.map(cf => {
        article.custom_fields[cf.key] = cf.value;
      });

      resolve(new ArticleModelRaw(article));
    });

    res.send(article);

  } catch (err) {

    console.log(err);

    res.status(500).send(new ErrorModel())
  }
}


/**
 * @route PUT /rest/article/{id}/lock
 * @group Articles
 * @param {integer} id.path.required
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @returns {Error.model} 403
 * @security JWT
 */
exports.lock = async (data, req, res, next) => {

  if(!req.params.id || !data.userData){ return next(); }

  try {

    let response = await ArticleSchema.update({ is_editing_by: data.userData.id }, { where: { id: req.params.id, is_editing_by: "" }});

    if(!response[0]){
      throw "Erro ao tentar bloquear item.";
    }

    return res.send(new SuccessModel("Item bloqueado para edição com sucesso.", { id: data.userData.id }));
  } catch (err) {

    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(err instanceof ErrorModel ? err : new ErrorModel(err && err.message ? err.message : "Erro ao tentar bloquear item.", models));

  }

}

/**
 * @route PUT /rest/article/{id}/unlock
 * @group Articles
 * @param {integer} id.path.required
 * @returns {Success.model} 200
 * @security JWT
 */
exports.unlock = async (data, req, res, next) => {

  if(!req.params.id || !data.userData){ return next(); }

  let response = await ArticleSchema.update({ is_editing_by: ""}, { where: { id: req.params.id }});
  return res.send(new SuccessModel("Item desbloqueado para edição com sucesso."));
}


/**
 * @route PUT /rest/article/{id}/archive
 * @group Articles
 * @param {integer} id.path.required
 * @returns {Success.model} 200
 * @security JWT
 */
exports.archive = async (data, req, res, next) => {

  if(!req.params.id || !data.userData){ return next(); }

  let response = await ArticleSchema.update({ is_editing_by: "", archived: 1, status: 0 }, { where: { id: req.params.id }});
  await LogSchema.create({ user: data.userData.id, action: 'ARCHIVE', target: req.params.id, type: 'ARTICLE' });
  return res.send(new SuccessModel("Item arquivado com sucesso."));
}

/**
 * @route PUT /rest/article/{id}/unarchive
 * @group Articles
 * @param {integer} id.path.required
 * @returns {Success.model} 200
 * @security JWT
 */
exports.unarchive = async (data, req, res, next) => {

  if(!req.params.id || !data.userData){ return next(); }

  let response = await ArticleSchema.update({ is_editing_by: data.userData.id, archived: 0, status: 0 }, { where: { id: req.params.id }});
  await LogSchema.create({ user: data.userData.id, action: 'UNARCHIVE', target: req.params.id, type: 'ARTICLE' });
  return res.send(new SuccessModel("Item recuperado com sucesso."));
}


/**
 * @route GET /rest/posttype/{id}/featured
 * @group Post Type
 * @param {integer} id.path
 * @returns {Array<Article>} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.getFeatured = async (data, req, res, next) => {

  const id = req.params.id;

  if(!id) { return res.status(403).send(new ErrorModel()) }

  var idList = [];

  await AssociationSchema.findAll({ 
    attributes: ["value"],
    where: {
      type: "ARTICLE_FEATURED",
      target: id
    },
  }).then((items) => {
    idList = items.map(a => a.value);
  });


  if(!idList.length){ return res.send([]); }


  try {

    var dbResponse = await ArticleSchema.findAll({
      where: {
        id: {
          [Sequelize.Op.in] : idList
        },
        parent: id,
        archived: 0
      }
    });

    dbResponse = await Promise.all(dbResponse.map(async (a) => {
      a = new ArticleModel(a).Populate();
      return a;
    }));

    let items = [];

    idList.forEach(id => {
      let item = dbResponse.find(a => a.id == id);
      if( item ) { items.push(item); }
    });


    return res.send(items);

  } catch( err ) {

    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(err instanceof ErrorModel ? err : new ErrorModel(err && err.message ? err.message : "Erro ao tentar buscar itens.", models));
  }
}

/**
 * @route PUT /rest/posttype/{id}/featured
 * @group Post Type
 * @param {integer} id.path
 * @param {Array<integer>} articlesIds.query - Integers separated by comma
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.updateFeatured = async (data, req, res, next) => {

  const id = req.params.id;


  if(!id) { return res.status(403).send(new ErrorModel()) }


  if( !req.query.articlesIds ) { return res.status(403).send(new ErrorModel("articlesIds it's required.")) }

  var articlesIds = req.query.articlesIds.split(',').filter(a => !isNaN(a));

  await AssociationSchema.destroy({
    where: {
      target: id,
      type: 'ARTICLE_FEATURED'
    }
  });


  let associations = [];

  articlesIds.forEach(a => {
    associations.push({ target: id, value: a, type: "ARTICLE_FEATURED", key: "featured" })
  });

  if( associations ) {
    await AssociationSchema.bulkCreate(associations);
  }

  await LogSchema.create({ user: data.userData.id, action: 'UPDATE', target: id, type: 'ARTICLE_FEATURED' });

  res.send(new SuccessModel("Artigos em destaque atualizados."));

}
