const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { validateRental, Rental } = require("../models/rental");
const router = express.Router();
const { Movie } = require("../models/movie");

router.post("/", [auth, validate(validateRental)], postReturn);

async function postReturn(req, res) {
  const { customerId, movieId } = req.body;
  const rental = await Rental.lookup(customerId, movieId);

  if (!rental) return res.status(404).send("Rental not found");

  if (rental.dateReturned)
    return res.status(400).send("Return already processed");

  rental.return();
  await rental.save();

  await Movie.findOneAndUpdate(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 },
    }
  );

  return res.status(200).send(rental);
}

module.exports = router;
