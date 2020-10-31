const { UserSchema, ConfigSchema, PostTypeSchema, sequelize } = require("../../core/schemas.js");
const fs = require('fs');
const path = require('path');

exports.index = async (req, res) => {

  var data = {
    errors: [],
    isDone: false
  };

  var usersData = await UserSchema.findAll();
  var configData = await ConfigSchema.findAll({'atributes' : ['id']});
  var posttypeData = await PostTypeSchema.findAll();

  data.isDone = (usersData && usersData.length) && (configData && configData.length) && (posttypeData && posttypeData.length);

  if( data.isDone || !Object.keys(req.body).length ){

    if( data.isDone && fs.existsSync(path.join(__dirname, '../../.install')) ) {
      
      fs.unlink(path.join(__dirname, '../../.install'), (err) => {
        if (err) {
          return res.sendStatus(500);
        }
      })
    };

    return res.render("install", data);
  }


  var proms = [];

  if( !usersData || !usersData.length ) {
    var user = {
      name: req.body.userName,
      role: 'dev',
      front_role: 'Admin',
      email: req.body.userEmail,
      password: req.body.userPassword,
      bio: '',
      active: true
    };

    proms.push(UserSchema.create(user));
  }

  if( !configData || !configData.length ) {
    ['siteName', 'siteUrl'].map(a => {
      proms.push(
        ConfigSchema.create({
          key_value: req.body[a],
          key_name: (a.toLowerCase() == 'sitename' ? "Nome do Site" : "Descrição do site"), 
          key_slug: a.toLowerCase()
        })
      )
    });
  }


  if( !posttypeData || !posttypeData.length ) {
    proms.push(PostTypeSchema.create({
      title: "Posts",
      description: "",
      slug: 'posts'
    }));
  }



  await Promise.all(proms)
    .then( response => {
      data.isDone = true;

      if( data.isDone && fs.existsSync(path.join(__dirname, '../../.install')) ) {
        fs.unlink(path.join(__dirname, '../../.install'), (err) => {
          if (err) {
            console.error(err)
            return res.sendStatus(500);
          }

          return res.render("install", data);
        })
      };

    })
    .catch( err => {
      console.log('err',  err);
      return res.render("install", data);
    });

  
}
