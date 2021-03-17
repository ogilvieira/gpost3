const { AssociationSchema, PostTypeSchema, Sequelize } = require('../schemas');


function ArticleQuery(data) {
  this.posttypeID = data.posttypeID || null;
  this.page = Number(data.page) || 1;
  this.terms = data.terms || null;
  this.category = data.category ? Number(data.category) : null;
  this.tag = data.tag ? ''+data.tag : null;
  this.custom_fields = data.custom_fields || null;
  this.except = data.except || null;
  this.paginate = Number(data.paginate);
  this.status = data.status ? Number(data.status) : null;
  this.author = data.author ? Number(data.author) : null;
  this.publishedDate = data.publishedDate || null
  this.archived = data.archived || 0;

  if( isNaN(this.paginate) ) {
    this.paginate = 10;
  }


  this.Generate = async () => {


    //BASIC QUERY
    let objQuery = {
      where: {
        parent: {},
        archived: 0
       },
      order: [['published_date', 'DESC']]
    };

    if( this.publishedDate ) {
      objQuery.where.published_date = {
        [Sequelize.Op.lt] : this.publishedDate
      }
    }

    // Set Status
    if( typeof this.status == 'number' ) {
      objQuery.where.status = this.status;
    }

   // Set Arquived
    if( this.archived ) {
      objQuery.where.archived = 1;
    }



    // SET PAGINATE
    if( this.paginate ) {
      objQuery.page = this.page;
      objQuery.paginate = this.paginate;
    }

    // FILTER: BY PARENT/POSTTYPE
    if( this.posttypeID ) {
      objQuery.where.parent = this.posttypeID;
    } else {
      let posttypeList = await PostTypeSchema.findAll({ where: { system: "ARTICLE", show_in_search: 1 } });

      let parentsIDs = [];
      posttypeList.map(a => {
        parentsIDs.push(a.id);
      })

      objQuery.where.parent[Sequelize.Op.in] = parentsIDs;
    }


    // FILTER: Terms
    if( this.terms ) {
      objQuery.where[Sequelize.Op.or] = {
        title: {
          [Sequelize.Op.like]: `%${this.terms}%`
        },
        content: {
          [Sequelize.Op.like]: `%${this.terms}%`
        },
        description: {
          [Sequelize.Op.like]: `%${this.terms}%`
        },
        seo_description: {
          [Sequelize.Op.like]: `%${this.terms}%`
        },
        seo_title: {
          [Sequelize.Op.like]: `%${this.terms}%`
        }
      }
    };


    // FILTER: BY CATEGORY
    if( this.category ) {
      objQuery.where.category = this.category;
    }

    // FILTER: BY AUTHOR
    if( this.author ) {
      objQuery.where.author = this.author;
    }


    // FILTER: BY CUSTOM FIELD
    if( this.custom_fields ) {
      let customFieldObj = {};

      this.custom_fields = this.custom_fields.split(";");
      this.custom_fields.map(a => {
        if( a.split(":").length == 2 ) {
          customFieldObj = {
            key: a.split(":")[0],
            value: a.split(":")[1],
          };
        }
      });

      if( Object.values(customFieldObj) && Object.values(customFieldObj).length ) {
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


    //FILTER: BY TAG
    if( this.tag ) {
      
      let idsTags = await AssociationSchema.findAll({
        where: { type: 'TAG', value: this.tag },
        attributes: ['target']
      });

      if( idsTags && idsTags.length ) {
        if( !objQuery.where.id ){ objQuery.where.id = {} }
        objQuery.where.id[Sequelize.Op.in] = idsTags.map(a => a.target);
      }

    }

    // FILTER: IGNORE IDS
    if( this.except ) {
      if( !objQuery.where.id ){ objQuery.where.id = {} }
      objQuery.where.id[Sequelize.Op.notIn] = this.except.split(',').filter( a => !isNaN(a) );
    }


    return objQuery;
  }

  return this;
}

module.exports = ArticleQuery;
