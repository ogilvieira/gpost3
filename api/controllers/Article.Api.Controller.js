const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const ArticleModel = require('../../core/models/ArticleModel');
const ArticleQueryModel = require('../../core/models/ArticleQueryModel');
const { ArticleSchema, AssociationSchema, PostTypeSchema, Sequelize } = require('../../core/schemas');

/**
 * @route GET /api/articles
 * @group Articles
 * @param {integer} posttype.query
 * @param {integer} paginate.query
 * @param {integer} page.query
 * @param {integer} category.query
 * @param {integer} author.query
 * @param {tag} tag.query - A string text tag name
 * @param {string} except.query - artcile's ids separated by comma "1,2,3,4..."
 * @param {string} terms.query
 * @param {string} custom_fields.query - "{keyName}:{Value}" separate by semicolon
 * @returns {Array<Article>} 200
 * @returns {Error.model} 404
 * @security JWT
 */
exports.getAll = async (req, res, next) => {

  const posttypeID = req.query.posttype || null;
  const page = Number(req.query.page) || 1;
  const terms = req.query.terms || null;
  const category = req.query.category || null;
  const author = req.query.author || null;
  const tag = req.query.tag || null;
  const custom_fields = req.query.custom_fields || null;
  const except = req.query.except || null;
  const paginate = Number(req.query.paginate);


  //validate posttype
  const posttypeList = await PostTypeSchema.findAll({ where: { system: "ARTICLE", show_in_search: 1 } });
  if(!posttypeList || (posttypeID && !posttypeList.find(a => a.id == posttypeID))){
    return res.send(new ErrorModel(posttypeID ? "PostType selecionado não existe ou não é público." : "Não há PostTypes públicos.")).status(404);
  }


  let articleQuery = new ArticleQueryModel({
    posttypeID: posttypeID,
    page: page,
    terms: terms,
    category: category,
    author: author,
    tag: tag,
    custom_fields: custom_fields,
    except: except,
    paginate: paginate,
    status: 1,
    publishedDate: new Date()
  });


  try {

    var objQuery = await articleQuery.Generate();

    if(!objQuery) { throw null; }
  
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

    return res.send(response);
  } catch (err) {
    console.log('err ', err);
    return next();
  }
}


/**
 * @route GET /api/article/{articleID}
 * @group Articles
 * @param {string} articleID.path Article's id or slug
 * @param {integer} posttype.query Required if articleID is a slug string
 * @returns {Array<Taxonomy>} 200
 * @returns {Error.model} 401
 */
exports.get = async (req, res, next) => {

  const articleID = req.params.articleID;

  if(!articleID) { return res.status(403).send(new ErrorModel()) }

  let objQuery = {
    where: {
      parent: {},
      status: 1,
      published_date: {
        [Sequelize.Op.lt] : new Date()
      }
    }
  };

  if( isNaN(articleID) ) {
    objQuery.where.slug = articleID;

    if( !req.query.posttype || isNaN(req.query.posttype) ) {
      return res.status(403).send(new ErrorModel())
    }

    objQuery.where.parent = req.query.posttype;

  } else {
    objQuery.where.id = articleID;
  }

  try {
    var article = await ArticleSchema.findOne(objQuery);

    if(!article) { throw null; }

    article = new ArticleModel(article);
    article = await article.Populate();

    return res.send(article);
  } catch (err) {
    console.log(err);
    return res.status(404).send(new ErrorModel(err ? err : "Post não encontrado."));
  }
}



/**
 * @route GET /api/posttype/{posttypeID}/featured
 * @group Post Type
 * @param {integer} posttypeID.path
 * @returns {Array<Article>} 200
 */
exports.getFeatured = async (req, res, next) => {

  const posttypeID = req.params.posttypeID;

  if(!posttypeID) { return res.status(403).send(new ErrorModel()) }

  var idList = [];

  await AssociationSchema.findAll({ 
    attributes: ["value"],
    where: {
      type: "ARTICLE_FEATURED",
      target: posttypeID,
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
        parent: posttypeID,
        published_date: {
          [Sequelize.Op.lt] : new Date()
        },
        status: 1,
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
    if(err && err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(err instanceof ErrorModel ? err : new ErrorModel(err && err.message ? err.message : "Erro ao tentar buscar itens.", models));
  }
}
