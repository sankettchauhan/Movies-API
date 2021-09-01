const winston = require("winston");
// require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
  winston.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      handleExceptions: true,
    })
  );
  winston.add(new winston.transports.File({ filename: "logfile.log" }));
  // winston.add(
  //   new winston.transports.MongoDB({
  //     db: "mongodb://localhost/vidly",
  //     options: {
  //       useUnifiedTopology: true,
  //     },
  //     level: "info",
  //   })
  // );

  winston.exceptions.handle(
    new winston.transports.File({ filename: "unhandledExceptions.log" })
  );

  process.on("unhandledRejection", (ex) => {
    throw ex;
  });
};
