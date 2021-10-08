const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const auth = require("../middlewares/auth");
const { User, validateUser } = require("../models/user");

router.post("/", createUser);
router.get("/me", auth, getUser);

async function createUser(req, res) {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  try {
    user = await user.save();
    const token = user.generateAuthToken();
    res
      .header("x-auth-token", token)
      .status(201)
      .send(_.pick(user, ["_id", "email", "name"]));
  } catch (error) {
    res.status(400).send(`Error: ${error.message}`);
  }
}

async function getUser(req, res) {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).send(user);
}

module.exports = router;
