const express = require("express");
const router = express.Router();
const { validateGenre, Genre } = require("../models/genre");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validateObjectId = require("../middlewares/validateObjectId");

router.get("/", auth, getGenres);
router.post("/", auth, createGenre);
router.put("/:id", validateObjectId, updateGenre);
router.delete("/:id", [validateObjectId, auth, admin], deleteGenre);
router.get("/:id", [validateObjectId, auth], getGenreById);

async function getGenres(req, res) {
  const result = await Genre.find();
  return res.status(200).send(result);
}

async function createGenre(req, res) {
  const { error } = validateGenre(req.body.name);
  if (error) return res.status(400).send(error.details[0].message);
  else {
    let genre = new Genre({ name: req.body.name });
    genre = await genre.save();
    return res.status(201).send(genre);
  }
}

async function updateGenre(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  const { error } = validateGenre(name);
  if (error) return res.status(400).send(error.message);
  const genre = await Genre.findByIdAndUpdate(id, { name });
  if (!genre)
    return res.status(404).send(`The genre with given id ${id} is not found.`);
  return res.status(200).send(genre);
}

async function deleteGenre(req, res) {
  const { id } = req.params;
  const result = await Genre.findByIdAndDelete(id);
  if (!result) return res.status(400).send("Could not find the id");
  return res.status(200).send(`Deleted genre: ${result}`);
}

async function getGenreById(req, res) {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send(`Requested genre not found.`);
  return res.status(200).send(genre);
}

module.exports = router;
