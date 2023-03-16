const express = require("express");
const router = express.Router();
const contacts = require("../../models/contacts");
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

router.get("/", async (req, res, next) => {
  const list = await contacts.listContacts();
  res.json({
    status: "success",
    code: 200,
    data: list,
  });
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  const contactById = await contacts.getContactById(contactId);
  if (!contactById) {
    res.status(404).json({ message: "This contact doesn't exist" });
  }

  res.json({
    status: "success",
    code: 200,
    data: { contactById },
  });
});

router.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;
  const { error } = schema.validate({ name, email, phone });
  if (error) {
    res.status(400).json({ message: "missing required name field" });
    return;
  }
  const addContact = await contacts.addContact({ name, email, phone });
  res.status(201).json({
    status: "success",
    code: 201,
    data: { addContact },
  });
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  const contactById = await contacts.getContactById(contactId);
  if (!contactById) {
    res.status(404).json({ message: "This contact doesn't exist" });
  }
  await contacts.removeContact(contactId);
  res.json({
    status: "success",
    code: 200,
    data: { contactById },
  });
});

router.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  const contactById = await contacts.getContactById(contactId);
  if (!contactById) {
    res.status(404).json({ message: "This contact doesn't exist" });
  }

  await contacts.removeContact(contactId);
  const { name, email, phone, favorite } = req.body;
  const { error } = schema.validate({ name, email, phone });
  if (error) {
    res.status(400).json({ message: "missing required name field" });
    return;
  }
  const task = {
    _id: contactId,
    name,
    email,
    phone,
    favorite,
  };

  const addContact = await contacts.addContact(task);
  res.status(201).json({
    status: "success",
    code: 201,
    data: { addContact },
  });
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;
  const { error } = schemaFav.validate({ favorite });
  if (error) {
    res.status(400).json({ message: "missing field favorite" });
    return;
  }

  try {
    const result = await contacts.updateContact(contactId, { favorite });
    if (result) {
      res.json({
        status: "success",
        code: 200,
        data: { result },
      });
    } else {
      res.status(404).json({
        status: "error",
        code: 404,
        message: `Not found contact  ${contactId}`,
        data: "Not Found",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
