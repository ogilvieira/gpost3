const ErrorModel = require('../../core/models/ErrorModel');
const SuccessModel = require('../../core/models/SuccessModel');
const UserModel = require('../../core/models/UserModel');
const { UserSchema, Sequelize } = require('../../core/schemas');
const AuthModel = require('../../core/models/AuthModel');

/**
 * @route GET /rest/user
 * @group User
 * @param {integer} page.query
 * @param {integer} paginate.query
 * @param {string} terms.query
 * @returns {Array<User>} 200
 * @returns {Error.model} 401
 * @security JWT
 */
exports.getAll = async (data, req, res, next) => {

  var page = req.query.page || 1;
  var terms = req.query.terms || null; 
  var paginate = req.query.paginate || 10;

  if(page < 1){ page = 1; }
  var obj = {
    page: page,
    paginate: paginate,
    order: [['id', 'DESC']]
  };

  if(terms){
    obj.where = {};
    obj.where[Sequelize.Op.or] = {
      name: {
        [Sequelize.Op.like]: `%${terms}%`
      },
      email: {
        [Sequelize.Op.like]: `%${terms}%`
      }
    }
  }

  try {
    await UserSchema.paginate(obj)
    .then(response => {
      
      if( response && response.docs ) {
        response.docs = response.docs.map(a => new UserModel(a));
      }

      res.send(response);
    });
  } catch ( err ) {
    res.status(500).send(new ErrorModel());
  }

}


/**
 * @route GET /rest/user/{id}
 * @group User
 * @param {integer} id.path
 * @returns {User.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.get = async (data, req, res, next) => {
  const id = req.params.id;

  if(!id) { return res.status(403).send(new ErrorModel()) }

  try {
    var user = await UserSchema.findOne({ where: { id: id } });
    user = new UserModel(user);
    return res.send(user);
  } catch (err) {
    return res.status(404).send(new ErrorModel("Usuário não encontrado"));
  }

}

/**
 * @route PUT /rest/user/{id}
 * @group User
 * @param {integer} id.path
 * @param {User.model} data.body.required
 * @returns {User.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.update = async (data, req, res, next) => {
  if( !data.userData || data.userData instanceof ErrorModel ) {
    return res.status(401).send(data.userData instanceof ErrorModel ? data.userData : new ErrorModel());
  }

  const id = req.params.id;

  if(!id) { return res.status(403).send(new ErrorModel()) }

  const newUserData = {
    name: req.body.name || null,
    role: req.body.role || 'editor',
    front_role: 'Editor',
    email: req.body.email || null,
    bio: req.body.bio || '',
    active: req.body.active || 0
  };

  //disale auto-update status
  if(data.userData.id == id ) {
    delete newUserData.active;
  }

  if(!['admin','dev','editor'].find(a => newUserData.role)){
    newUserData.role = 'editor';
  }

  if( data.userData == 'admin' && newUserData.role == 'dev' ) {
    newUserData.role = 'admin';
  }

  var errors = {};

  if(!newUserData.name || newUserData.name.split(' ').length < 2 ) { errors.name = "Nome e sobrenome são requeridos.";  }
  if(!newUserData.email || newUserData.email.indexOf('@')==-1 || newUserData.email.indexOf('.')==-1 ) { errors.email = "E-mail inválido." }
  // if(!newUserData.password || newUserData.password.length < 6 ) { errors.password = "A senha precisa ter pelomenos 6 caracteres." }


  if( req.body.password ) {

    if(req.body.password.length < 6) {
      return res.status(403).send(new ErrorModel(null, {
        password: "Senha precisa ter pelomenos 6 caracteres.."
      }));
    }


    var auth = new AuthModel();
    newUserData.password = auth.encryptPass(req.body.password);
  }


  if( Object.keys(errors).length ) {
    return res.status(403).send(new ErrorModel(null, errors))
  }

  try {
    var user = await UserSchema.update(newUserData, { where: { id: id }});
    return res.send(new SuccessModel("Usuário atualizado com sucesso.", new UserModel(user)));
  } catch (err) {
    return res.status(403).send(new ErrorModel("Não foi possível atualizar o usuário."));
  }

}

/**
 * @route POST /rest/user
 * @group User
 * @param {User.model} data.body.required
 * @returns {Success.model} 200
 * @returns {Error.model} 401
 * @security JWTs
 */
exports.add = async (data, req, res, next) => {

  const newUserData = {
    name: req.body.name || null,
    role: req.body.role || 'editor',
    front_role: 'Editor',
    email: req.body.email || null,
    password: req.body.password || '',
    bio: req.body.bio || '',
    active: req.body.active || 0
  };

  if(!['admin','dev','editor'].find(a => newUserData.role)){
    newUserData.role = 'editor';
  }

  if( data.userData == 'admin' && newUserData.role == 'dev' ) {
    newUserData.role = 'admin';
  }

  var errors = {};

  if(!newUserData.name || newUserData.name.split(' ').length < 2 ) { errors.name = "Nome e sobrenome são requeridos.";  }
  if(!newUserData.email || newUserData.email.indexOf('@')==-1 || newUserData.email.indexOf('.')==-1 ) { errors.email = "E-mail inválido." }
  if(!newUserData.password || newUserData.password.length < 6 ) { errors.password = "A senha precisa ter pelomenos 6 caracteres." }


  if( Object.keys(errors).length ) {

    return res.status(403).send(new ErrorModel(null, errors))
  }


  try {
    var user = await UserSchema.create(newUserData);
    return res.send(new SuccessModel("Usuário criado com sucesso.", new UserModel(user)));
  } catch (err) {
    return res.status(403).send(new ErrorModel("Não foi possível cadastrar o usuário."));
  }

}
