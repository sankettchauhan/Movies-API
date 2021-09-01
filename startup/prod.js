const compression = require("compression");
const helmet = require("helmet");

modules.exports = function (app) {
  app.use(helmet());
  app.use(compression());
};
