const { UserSchema, sequelize } = require('../../core/schemas');
const bcrypt = require('bcryptjs');

function Model(data) {
  this.data = data || {};
}


Model.prototype.get = async function(param) {
  if(!param){ return; }

  let obj = {};

  if( typeof param == "string" && isNaN(param) ){ obj = { slug: param }; };
  if( !isNaN(param) ){ obj = { id: param }; };
  if( typeof param == "object" ){ obj = param; };

  return await UserSchema.findOne({ where: obj }).then( data => {
    this.data = data;
  });
};

Model.prototype.getAll = async function(page = 1, query = null, paginate = 9) {
  if(page < 1){ page = 1; }
  var obj = {
    attributes: ['id', 'name', 'front_role', 'email', 'bio', 'role', 'active'],
    page: page,
    paginate: paginate,
    order: [['id', 'DESC']]
  };

  if(query){
    obj.where = {};
    obj.where['name'] = { [sequelize.Op.like]: `%${query}%` };
  }

  return await UserSchema.paginate(obj);
};

Model.prototype.isActive = function(){
  return !!this.data.active;
}

Model.prototype.validPassword = function(password) {
  return bcrypt.compareSync(password, this.data.password);
}

Model.prototype.getUser = function() {
  var o = Object.assign({}, this.data);
  if(o.password) delete o.password;
  return o;
}

Model.prototype.update = async function(obj) { 

  if( obj.password ){
    const salt = bcrypt.genSaltSync();
    obj.password = bcrypt.hashSync(obj.password, salt);
  }

  return await UserSchema.update(obj, { where: { id: this.data.id }}).then(r => {
    return this.data;
  });
}

Model.prototype.delete = async function() {
  return await UserSchema.destroy({ where: { id: this.data.id }}).then(r => {
    return this.data;
  });
}

Model.prototype.save = async function(obj) {
  return await UserSchema.create(this.data).then( r => {
    return this.data;
  });
}


module.exports = Model;
