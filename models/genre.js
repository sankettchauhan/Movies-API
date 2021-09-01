const mongoose = require("mongoose");
const Joi = require("joi");

const genreSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 50,
    lowercase: true,
    trim: true,
  },
});

const Genre = mongoose.model("Genre", genreSchema);

function validateId(id) {
  const schema = Joi.object({
    id: Joi.objectId().required(),
  });
  return schema.validate({ id });
}

function validateGenre(name) {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(30),
  });
  return schema.validate({ name });
}

module.exports = { genreSchema, Genre, validateGenre, validateId };
