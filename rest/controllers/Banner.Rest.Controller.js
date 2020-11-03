const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const BannerModel = require('../../core/models/BannerModel');
const TaxonomyModel = require('../../core/models/TaxonomyModel');
const { TaxonomySchema, BannerSchema } = require('../../core/schemas');
const ImageManager = require('../../core/ImageManager');


/**
 * @route GET /rest/banner
 * @group Banner
 * @returns {Array<Taxonomy>} 200
 * @returns {Error.model} 401
 * @security JWT
 */
exports.getAll = async (data, req, res, next) => {

  try {
    const taxonomies = await TaxonomySchema.findAll({ where: {
      system: "BANNER"
    }});

    res.send(taxonomies);

  } catch (err) {
    res.status(500).send(new ErrorModel())
  }
}

/**
 * @route GET /rest/banner/{id}
 * @group Banner
 * @param {integer} id.path
 * @returns {Taxonomy.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.get = async (data, req, res, next) => {
  const id = req.params.id;

  if(!id) { return res.status(403).send(new ErrorModel()) }

  try {
    var bannerArea = await TaxonomySchema.findOne({ where: { id: id } });
    bannerArea = new TaxonomyModel(bannerArea);
    return res.send(bannerArea);
  } catch (err) {
    return res.status(404).send(new ErrorModel("Área de banner não encontrada."));
  }

}

/**
 * @route POST /rest/banner
 * @group Banner
 * @param {Taxonomy.model} data.body.required
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.add = async (data, req, res, next) => {
  
  const BannerArea = new TaxonomyModel({
    title: req.body.title,
    description: req.body.description || "",
    system: "BANNER"
  });


  try {
    var banner = await TaxonomySchema.create(BannerArea);
    return res.send(new SuccessModel("Área de banner criada com sucesso.", new TaxonomyModel(banner)));
  } catch (err) {
    
    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(new ErrorModel(err && err.message ? err.message : "Não foi possível cadastrar.", models));
  }

}

/**
 * @route PUT /rest/banner
 * @group Banner
 * @param {Taxonomy.model} data.body.required
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.update = async (data, req, res, next) => {
  const id = req.params.id;

  if(!id) { return res.status(403).send(new ErrorModel()) }

  const BannerArea = new TaxonomyModel({
    id: id,
    title: req.body.title,
    description: req.body.description || "",
    system: "BANNER"
  });


  try {
    var banner = await TaxonomySchema.update(BannerArea, { where: { id: id }});
    return res.send(new SuccessModel("Área de Banner atualizada com sucesso.", new TaxonomyModel(banner)));
  } catch (err) {
    
    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(new ErrorModel(err && err.message ? err.message : "Não foi possível cadastrar.", models));
  }

}


/**
 * @route GET /rest/banner/{id}/items
 * @group Banner
 * @param {integer} id.path
 * @returns {Taxonomy.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.getItems = async (data, req, res, next) => {
  const id = req.params.id;

  if(!id) { return res.status(403).send(new ErrorModel()) }

  try {
    var banners = await BannerSchema.findAll({ where: { category: id }, order: [['order','ASC']] });
    return res.send(banners);
  } catch (err) {
    return res.status(404).send(new ErrorModel("Área de banner não encontrada."));
  }

}



/**
 * @route PUT /rest/banner/{id}/item/{itemID}
 * @group Banner
 * @param {integer} id.path
 * @param {integer} itemID.path
 * @returns {Banner.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.updateItem = async (data, req, res, next) => {
  const category = req.params.id;
  const itemID = req.params.itemID;
  if(!category || !req.body || !itemID) { return res.status(403).send(new ErrorModel()) }

  var item = {};
  
  ['title', 'image', 'link', 'order', 'start_date', 'end_date'].map(key =>{
    if(!!req.body[key]) {
      item[key] = req.body[key];
    }
  });

  if( !item.image || typeof item.image != 'string' ) {
    return res.status(403).send(new ErrorModel("A imagem é obrigatória."));
  }
  
  try {
    await BannerSchema.update(item, { where: { id: itemID, category: category }});
    return res.send(new SuccessModel("Item de Banner atualizado com sucesso."));
  } catch (err) {
   
    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(new ErrorModel(err && err.message ? err.message : "Não foi possível atualizar o item de Banner.", models));
  }

}


/**
 * @route POST /rest/banner/{id}/item/new
 * @group Banner
 * @param {integer} id.path
 * @returns {Banner.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.addItem = async (data, req, res, next) => {
  const id = req.params.id;
  if(!id || !req.body ) { return res.status(403).send(new ErrorModel()) }

  var item = {};

  if(req.body.image && typeof req.body.image != 'string') {
    res.status(403).send(new ErrorModel("A imagem é obrigatório."));
  }
  
  ['title', 'image', 'link', 'order', 'start_date', 'end_date', 'lang'].map(key =>{
    if(!!req.body[key]) {
      item[key] = req.body[key];
    }
  });

  item.category = id;

  try {
    await BannerSchema.create(item);
    return res.send(new SuccessModel("Item de Banner criado com sucesso."));
  } catch (err) {
   
    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(new ErrorModel(err && err.message ? err.message : "Não foi possível cadastrar o item de Banner.", models));
  }
}

/**
 * @route DELETE /rest/banner/{id}/item/{itemID}
 * @group Banner
 * @param {integer} id.path
 * @param {integer} itemID.path
 * @returns {Banner.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.deleteItem = async (data, req, res, next) => {
  const category = req.params.id;
  const itemID = req.params.itemID;
  if(!category || !itemID ) { return res.status(403).send(new ErrorModel()) }


  try {
    await BannerSchema.destroy({ where: { id: itemID, category: category }});
    return res.send(new SuccessModel("Item de Banner excluído com sucesso."));
  } catch (err) {
   
    let models = {}
    if(err.errors) {
      err.errors.map(a => {
        models[a.path] = a.message;
      });
    }

    return res.status(403).send(new ErrorModel(err && err.message ? err.message : "Não foi possível excluir o item de Banner.", models));
  }
}
