const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Fawn = require("fawn");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const { Rental, validateRental, validateId } = require("../models/rental");
const auth = require("../middlewares/auth");

Fawn.init(mongoose);

router.get("/", auth, getRentals);
router.post("/", auth, createRental);
router.put("/:id", auth, updateRental);
router.delete("/:id", auth, deleteRental);
router.get("/:id", auth, getRentalById);
router.get("/customer/:customerId", auth, getRentalsOfCustomer);

async function getRentals(req, res) {
  try {
    const rentals = await Rental.find().sort("-dateOut");
    res.status(200).send(rentals);
  } catch (error) {
    res.status(400).send(`Error : ${error.message}`);
  }
}

async function createRental(req, res) {
  const { error } = validateRental(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  else {
    let customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send("Customer does not exist.");

    let movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send("Movie does not exist.");

    if (movie.numberInStock === 0)
      return res.status(400).send("Movie not in stock.");

    let rental = new Rental({
      ...req.body,
      dateOut: new Date(),
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate,
      },
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        isGold: customer.isGold,
      },
    });
    try {
      new Fawn.Task()
        .save("rentals", rental)
        .update(
          "movies",
          { _id: movie._id },
          {
            $inc: {
              numberInStock: -1,
            },
          }
        )
        .run();
      res.status(201).send(rental);
    } catch (error) {
      res.status(400).send(`Error: ${error.message}`);
    }
  }
}

async function updateRental(req, res) {
  const { id } = req.params;
  const { error: errorRental } = validateRental(req.body);
  const { error: errorId } = validateId(id);
  if (errorRental) return res.status(400).send(errorRental.message);
  if (errorId) return res.status(400).send(errorId.message);
  try {
    const rental = await Rental.findByIdAndUpdate(id, req.body);
    if (!rental)
      return res
        .status(404)
        .send(`The rental with given id ${id} is not found.`);
    res.status(200).send(`Rental updated : ${rental}`);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(`Error : ${error.message}`);
  }
}

async function deleteRental(req, res) {
  const { id } = req.params;
  try {
    const result = await Rental.findByIdAndDelete(id);
    if (!result)
      return res.status(400).send(`Could not find rental with id ${id}`);
    res.status(200).send(`Deleted rental: ${result}`);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(`Error : ${error.message}`);
  }
}

async function getRentalById(req, res) {
  const { id } = req.params;
  const { error } = validateId(id);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const rental = await Rental.findById(id);
    if (!rental)
      return res.status(404).send(`Requested rental with id ${id} not found.`);
    res.status(200).send(rental);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(`Error : ${error.message}`);
  }
}

async function getRentalsOfCustomer(req, res) {
  try {
    const customerId = req.params.customerId;
    console.log("customerId: ", customerId);
    let rentals;
    await Rental.find({}, (err, res) => {
      rentals = res.filter((rental) => rental.customer._id.equals(customerId));
    });
    res.status(200).send(rentals);
  } catch (error) {
    res.status(400).send(`Error : ${error.message}`);
  }
}
module.exports = router;
