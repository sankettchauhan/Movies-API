const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const router = express.Router();
const {
  Customer,
  validateCustomer,
  validateId,
} = require("../models/customer");

router.get("/", auth, getCustomers);
router.post("/", [validate(validateCustomer), auth], createCustomer);
router.put("/:id", auth, updateCustomer);
router.delete("/:id", auth, deleteCustomer);
router.get("/:id", auth, getCustomerById);

async function getCustomers(req, res) {
  const cutomers = await Customer.find();
  res.status(200).send(cutomers);
}

async function createCustomer(req, res) {
  let customer = new Customer(req.body);
  customer = await customer.save();
  res.status(200).send(customer);
}

async function updateCustomer(req, res) {
  const { id } = req.params;
  const { error: errorCustomer } = validateCustomer(req.body);
  const { error: errorId } = validateId(id);
  if (errorCustomer) return res.status(400).send(errorCustomer.message);
  if (errorId) return res.status(400).send(errorId.message);
  const customer = await Customer.findByIdAndUpdate(id, req.body);
  if (!customer)
    return res
      .status(404)
      .send(`The customer with given id ${id} is not found.`);
  res.status(200).send(`Customer updated : ${customer}`);
}

async function deleteCustomer(req, res) {
  const { id } = req.params;
  const result = await Customer.findByIdAndDelete(id);
  if (!result)
    return res.status(400).send(`Could not find customer with id ${id}`);
  res.status(200).send(`Deleted customer: ${result}`);
}

async function getCustomerById(req, res) {
  const { id } = req.params;
  const { error } = validateId(id);
  if (error) return res.status(400).send(error.details[0].message);
  const customer = await Customer.findById(id);
  if (!customer)
    return res.status(404).send(`Requested customer with id ${id} not found.`);
  res.status(200).send(customer);
}

module.exports = router;
