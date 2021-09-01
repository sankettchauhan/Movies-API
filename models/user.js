const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    minlegth: 5,
    maxlength: 255,
  },
  password: {
    type: String,
    required: true,
    minlegth: 5,
    maxlength: 1024,
  },
  isAdmin: { type: Boolean },
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().required().min(5).max(50),
    email: Joi.string().required().min(5).max(255).email(),
    password: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(user);
}

function validateId(id) {
  const schema = Joi.object({
    id: Joi.objectId().required(),
  });
  return schema.validate({ id });
}

module.exports = { User, validateUser, validateId };
