const winston = require("winston");

module.exports = function (ex, req, res, next) {
  // DIFFERENT LEVELS OF LOGGING - error warn info verbose debug silly
  winston.error(ex.message, { meta: ex });
  res.status(500).send("Something went wrong.");
};
