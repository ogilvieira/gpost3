var { UserSchema } = require('../../core/schemas');
var ErrorModel = require('./ErrorModel');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @typedef Auth
 * @property {string} email.required
 * @property {string} password.required
 */

function Model(email = null, password = null, token = null) {
  this.email = email;
  this.password = password;
}

Model.prototype.checkPassword = function(password, encryptedPassword) {
  return bcrypt.compareSync(password, encryptedPassword);
}

Model.prototype.run = async function() {
    
    return UserSchema.findOne({ where: { email: this.email }}).then( async user => {

      if( !user ) throw new ErrorModel(null, {
        email: "Usuário inválido"
      });

      if(!user.active) {
        throw new ErrorModel("Sem permissão de acesso");
      }

      var isMatch = this.checkPassword(this.password, user.password);

      if( !isMatch ){
        throw (new ErrorModel(null, {
            "password" : "Senha inválida"
          }
        ));
      }

      var token = jwt.sign({ id: user.id }, process.env.SECRET, {
        expiresIn: 21600 // expires in 6h 
      });

      await UserSchema.update({ last_access: new Date() }, { where: { id: user.id }});

      return token;

    }).catch(err => {
      throw err;
    });
};

Model.prototype.encryptPass = function( password ) {
  const salt = bcrypt.genSaltSync();
  password = bcrypt.hashSync(password, salt);
  return password;
}

module.exports = Model;
