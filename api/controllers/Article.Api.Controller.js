const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const ArticleModelRaw = require('../../core/models/ArticleModelRaw');
const ArticleModel = require('../../core/models/ArticleModel');
const CustomFieldModel = require('../../core/models/CustomFieldModel');
const { ArticleSchema, AssociationSchema, PostTypeSchema, Sequelize } = require('../../core/schemas');

/**
 * @route GET /api/articles
 * @group Articles
 * @param {integer} posttype.query
 * @param {integer} paginate.query
 * @param {integer} page.query
 * @param {integer} category.query
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
  var custom_fields = req.query.custom_fields || null;
  var except = req.query.except || null;
  var paginate = Number(req.query.paginate);

  if( isNaN(paginate) ) {
    paginate = 10;
  }

  //validate posttype
  const posttypeList = await PostTypeSchema.findAll({ where: { system: "ARTICLE", show_in_search: 1 } });

  if(!posttypeList || (posttypeID && !posttypeList.find(a => a.id == posttypeID))){
    return res.send(new ErrorModel(posttypeID ? "PostType selecionado não existe ou não é público." : "Não há PostTypes públicos.")).status(404);
  }


  let objQuery = {
    where: {
      parent: {},
      status: 1,
      published_date: {
        [Sequelize.Op.lt] : new Date()
      }
     },
    order: [['published_date', 'DESC']]
  };

  if( posttypeID ) {
    objQuery.where.parent = posttypeID;
  } else {

    let parentsIDs = [];
    posttypeList.map(a => {
      parentsIDs.push(a.id);
    })

    objQuery.where.parent[Sequelize.Op.in] = parentsIDs;
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
    objQuery.where.id[Sequelize.Op.notIn] = except.split(',').filter( a => isNaN(a) );
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
    console.log(err);
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

    article = new ArticleModel(article);
    article = await article.Populate();

    return res.send(article);
  } catch (err) {
    console.log(err);
    return res.status(404).send(new ErrorModel(err ? err : "Post não encontrado."));
  }
}
