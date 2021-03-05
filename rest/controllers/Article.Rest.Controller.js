const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const ArticleModelRaw = require('../../core/models/ArticleModelRaw');
const ArticleModel = require('../../core/models/ArticleModel');
const CustomFieldModel = require('../../core/models/CustomFieldModel');
const { ArticleSchema, AssociationSchema, PostTypeSchema, Sequelize } = require('../../core/schemas');
const ImageManager = require('../../core/ImageManager');

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

  const parentID = req.params.id;
  const page = Number(req.query.page) || 1;
  const terms = req.query.terms || null;
  const category = req.query.category || null;
  const author = req.query.author || null;
  var custom_fields = req.query.custom_fields || null;
  var except = req.query.except || null;
  var paginate = Number(req.query.paginate);

  if( Number.isNaN(paginate) ) {
    paginate = 10;
  }

  if(!parentID){ return next(); }

  let objQuery = {
    where: { parent: parentID },
    order: [['published_date', 'DESC']]
  }

  if( paginate ) {
    objQuery.page = page;
    objQuery.paginate = paginate;
  }


  if( terms ) {
    objQuery.where[Sequelize.Op.or] = {
      title: {
        [Sequelize.Op.like]: `%${terms}%`
      },
      content: {
        [Sequelize.Op.like]: `%${terms}%`
      },
      description: {
        [Sequelize.Op.like]: `%${terms}%`
      },
      seo_description: {
        [Sequelize.Op.like]: `%${terms}%`
      },
      seo_title: {
        [Sequelize.Op.like]: `%${terms}%`
      }
    }
  };

  if( category ) {
    objQuery.where.category = category;
  }

  if( author ) {
    objQuery.where.author = author;
  }

  // FILTER BY CUSTOM FIELD
  if( custom_fields ) {
    let customFieldObj = {};

    custom_fields = custom_fields.split(";");
    custom_fields.map(a => {
      if( a.split(":").length == 2 ) {
        customFieldObj = {
          key: a.split(":")[0],
          value: a.split(":")[1],
        };
      }
    });

    if( Object.values(customFieldObj) ) {
      let arrCFPosts = [];

      let associations = await AssociationSchema.findAll({
          attributes: ['target'],
          where: {
            type: "ARTICLE_CUSTOM_FIELD",
            key: customFieldObj.key,
            value: customFieldObj.value
          }}
        );

      associations && associations.map(a => {
        arrCFPosts.push(a.target);
      });


      if( !objQuery.where.id ){ objQuery.where.id = {} }
      objQuery.where.id[Sequelize.Op.in] = arrCFPosts;

    }
  }

  // IGNORE IDS
  if( except ) {
    if( !objQuery.where.id ){ objQuery.where.id = {} }
    objQuery.where.id[Sequelize.Op.notIn] = except.split(',').filter( a => !isNaN(a) );
  }
  
  try {
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
      target: id,
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
        parent: id
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


  res.send(new SuccessModel("Artigos em destaque atualizados."));

}
