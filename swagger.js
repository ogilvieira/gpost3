const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json';
const endpointsFiles = ['./rest/rest.routes.js'];

swaggerAutogen(outputFile, endpointsFiles)
