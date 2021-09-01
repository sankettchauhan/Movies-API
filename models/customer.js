const Joi = require("joi");
const mongoose = require("mongoose");

const customerSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isGold: {
    type: Boolean,
    required: true,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(30),
    isGold: Joi.boolean().required(),
    phone: Joi.string()
      .length(10)
      .regex(/^[0-9]*$/)
      .messages({
        "string.pattern.base": "Phone must only contain digits.",
      })
      .required(),
  });
  return schema.validate(customer);
}

function validateId(id) {
  const schema = Joi.object({
    id: Joi.objectId().required(),
  });
  return schema.validate({ id });
}

module.exports = { Customer, validateCustomer, validateId };
