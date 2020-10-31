var { UserSchema } = require('../../core/schemas');

var UserModel = require('./UserModel');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function Model(email = null, password = null, token = null) {
  this.email = email;
  this.password = password;
  this.token = token;
  this.user = null;
}

Model.prototype.run = async function() {
  return new Promise(resolve => {
    
    UserSchema.findOne({ where: { email: this.email }}).then( user => {

      if( !user ) return resolve({
        message: 'Usuário não encontrado.',
        data: null,
        token: null
      });

      var user = new UserModel(user);

      var isActive = user.isActive();

      if(!isActive) {
        return resolve({
          message: "Sem permissão de acesso.",
          data: null,
          token: null
        });
      }

      var isMatch = user.validPassword(this.password);

      if( !isMatch ){
        return resolve({
          message: "Senha inválida.",
          data: null,
          token: null,
          user: null
        });
      }

      var token = jwt.sign({ id: user.data.id }, process.env.SECRET, {
        expiresIn: 3.024e+6 // expires in 5 week
      });

      return resolve({
        message: "Usuário e senha válidos!",
        data: null,
        user: user.getUser(),
        token: token
      })

    });

  })
};

Model.prototype.checkToken = async function(token) {
  if (!token) return false;
  this.token = token
  var decoded = null;

  try {
    decoded = jwt.verify(this.token, process.env.SECRET);
  } catch( err ){
    if(err) return false;
  } 

  var user = new UserModel();
  await user.get(decoded.id);
  
  return {
    token: this.token,
    data: null,
    message: null,
    user: user.getUser()      
  }
}

module.exports = Model;
