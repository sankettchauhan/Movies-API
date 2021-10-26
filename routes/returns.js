const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { validateRentalId, Rental, validateId } = require("../models/rental");
const router = express.Router();
const { Movie } = require("../models/movie");

router.post("/", [auth, validate(validateRentalId)], postReturn);

async function postReturn(req, res) {
  const { rentalId } = req.body;
  const { error } = validateId(rentalId);
  if (error) return res.status(400).send(error.details[0].message);

  const rental = await Rental.findById(rentalId);

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
