var { ConfigSchema } = require('../../core/schemas');

function Model(data) {
  this.data = data || {};
}

Model.prototype.get = async function(param) {
  if(!param){ return; }

  let obj = {};

  if( typeof param == "string" && isNaN(param) ){ obj = { slug: param }; };
  if( !isNaN(param) ){ obj = { id: param }; };
  if( typeof param == "object" ){ obj = param; };

  return await ConfigSchema.findOne({ where: obj }).then( res => {
    this.data = res;
    // return this.data;
  });
};


Model.prototype.update = async function(obj) {
  
  if(!obj.hasOwnProperty("key_value")){ return; }

  return await ConfigSchema.update({ key_value: obj.key_value }, { where: { id: this.data.id }}).then(r => {
    this.data = r;
    return this.data;
  });
}

Model.prototype.save = async function(obj) {
  return await ConfigSchema.create(this.data).then( r => {
    this.data = r;
    return this.data;
  });
}


Model.prototype.delete = async function() {
  return await ConfigSchema.destroy({ where: { id: this.data.id, custom_type: 1 }}).then(r => {
    return this.data;
  });
}

Model.prototype.getAll = async function() {
  ConfigSchema.findAll();
}

module.exports = Model;
