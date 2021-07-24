const path = require('path');
const fs = require('fs');
const express = require('express');
const corsMiddleware = require('cors');
const pathToSwaggerUi = require("swagger-ui-dist").absolutePath();
const {
  middleware: openApiMiddleware,
  resolvers,
} = require('express-openapi-validator');

const openApiPath = path.join(__dirname, '..', 'assets', 'openapi.yaml');
const routeModulesBasePath = path.join(__dirname, 'routes');
const validateResponses = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const hostedUrl = `http://localhost:${port}`;

const app = express();

// Make the specification available
app.get('/openapi.yaml', (req, res) => {
  res.sendFile(openApiPath);
});

// Setup the Swagger-UI
// From: https://github.com/swagger-api/swagger-ui/issues/4624
const indexContent = fs.readFileSync(`${pathToSwaggerUi}/index.html`)
  .toString()
  .replace('https://petstore.swagger.io/v2/swagger.json', `${hostedUrl}/openapi.yaml`)

// Host the Swagger UI static files 
app.get('/swagger/', (req, res) => res.send(indexContent));
app.get('/swagger/index.html', (req, res) => res.send(indexContent));
app.use('/swagger', express.static(pathToSwaggerUi));

// Added CORS middleware to allow requests from other origins
app.use(corsMiddleware());

// Registers the OpenAPI middleware
app.use('/api',
  openApiMiddleware({
    apiSpec: openApiPath,
    validateResponses,
    operationHandlers: {
      basePath: routeModulesBasePath,
      resolver: resolvers.modulePathResolver,
    },
  }),
);

// Create an error handler
app.use((err, req, res, next) => {
  console.error(err); // dump error to console for debug
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

app.listen(port, () => {
  console.log(`Listening at ${hostedUrl}`);
});
