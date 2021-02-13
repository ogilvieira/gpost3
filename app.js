const express = require('express');
const http    = require('http');
const ejs    = require('ejs');
const engine = require('ejs-locals')
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const schemas = require("./core/schemas");
const path    = require('path');
const fs = require('fs');
const pjson = require('./package.json');
const fileUpload = require('express-fileupload');
const cors = require('cors');

var isInstall = false;

if( process.env.NO_INSTALL ) {
  isInstall = process.env.NO_INSTALL == 'true';
} else {
  isInstall = fs.existsSync(path.join(__dirname, '.install'));
}

const app = express();

app.set('port', process.env.PORT || 8080);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

//set template engine
app.engine('ejs', engine);
app.set('views', __dirname + `/${isInstall ? 'install' : 'ui'}/views`);
app.set('view engine', 'ejs');

//set trust proxy
app.set('trust proxy', true);

//set static files
app.use(express.static(path.join(__dirname, '/public')));

//set config of uploads
app.use(fileUpload({
  limits: { fileSize: 600 * 1024 }
}));


var BASE_URL = process.env.BASE_URL || "";

//set common middleware
app.use((req, res, next) => {
  let port = process.env.PORT || 8080;

  if(req.url.endsWith('.jpg') ||
    req.url.endsWith('.jpeg') ||
    req.url.endsWith('.png') ||
    req.url.endsWith('.svg') ||
    req.url.endsWith('.webp') ||
    req.url.endsWith('.gif')){

    res.set({ 'Cache-Control':'public, max-age=31536000' });
  };

  BASE_URL = BASE_URL || (req.protocol + '://' + req.hostname  + ((process.env.NODE_ENV == "production" || port == 80 || port == 443) ? '' : ':' + port));
  res.locals.BASE_URL = BASE_URL;
  next();
});

const routes = require(path.join(__dirname, `${ isInstall ? 'install/install' : 'ui/ui'}.routes.js`))(app);
app.use('/', routes);
const routesRest = require(path.join(__dirname, 'rest/rest.routes.js'))(app);
app.use('/rest', routesRest);

const routesApi = require(path.join(__dirname, 'api/api.routes.js'))(app);
app.use('/api', cors({
    credentials: true,
    origin: (origin, cb) => {  return cb(null, true); }
  }));

app.use('/api', routesApi);

//set swagger
const expressSwagger =  require('express-swagger-generator')(app);
let optionsSwagger = {
  swaggerDefinition: {
    info: {
      description: pjson.description,
      title: pjson.name,
      version: pjson.version,
    },
    host: `${BASE_URL.split("://").slice(1).join('')}`,
    basePath: BASE_URL ? '' : '/',
    produces: [
    "application/json",
    "application/xml",
    "multipart/form-data"
    ],
    schemes: [`${BASE_URL.split("://")[0]}`],
    securityDefinitions: {
      JWT: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        description: "",
      }
    }
  },
  basedir: __dirname, //app absolute path
  files: ['./api/**/*.js', './core/models/**/*.js']
};

if( process.env.NODE_ENV == 'development' ) {
  optionsSwagger.files.push('./rest/**/*.js');
}

expressSwagger(optionsSwagger);



//start server
const server = http.createServer(app);

schemas.sequelize
.authenticate()
.then(() => {
  server.listen(app.get('port'), '0.0.0.0', () => {
    console.log("Gpost listening on port " + app.get('port'));
  });
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});
