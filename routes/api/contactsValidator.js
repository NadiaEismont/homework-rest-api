const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().min(3).max(30).required(),

  phone: Joi.number().integer(),

  email: Joi.string().email({
    minDomainSegments: 2,
  }),
});

const schemaFav = Joi.object({
  favorite: Joi.boolean().required(),
});

module.exports = { schema, schemaFav };
