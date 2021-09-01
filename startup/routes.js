const express = require("express");
const genre = require("../routes/genre");
const customers = require("../routes/customers");
const movie = require("../routes/movie");
const rentals = require("../routes/rentals");
const users = require("../routes/users");
const auth = require("../routes/auth");
const returns = require("../routes/returns");
const error = require("../middlewares/error");

module.exports = function (app) {
  app.use(express.json());
  app.get("/", (req, res) => {
    res.send("Vidly API is running..");
  });
  app.use("/api/genre", genre);
  app.use("/api/customers", customers);
  app.use("/api/movie", movie);
  app.use("/api/rentals", rentals);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/returns", returns);
  app.use(error);
};
