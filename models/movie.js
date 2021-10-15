const Joi = require("joi");
const mongoose = require("mongoose");
const { genreSchema } = require("./genre");

const movieSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 255,
  },
  genres: [
    {
      type: genreSchema,
      required: true,
    },
  ],
  numberInStock: {
    type: Number,
    required: true,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
    min: 0,
    max: 255,
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
    min: 0,
    max: 255,
  },
});

const Movie = mongoose.model("Movie", movieSchema);

function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(30).required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required(),
    // genre: Joi.objectId().required(),
    genreIds: Joi.array().items(Joi.objectId()),
  });
  return schema.validate(movie);
}

function validateId(id) {
  const schema = Joi.object({
    id: Joi.objectId().required(),
  });
  return schema.validate({ id });
}

module.exports = { Movie, validateMovie, validateId };
