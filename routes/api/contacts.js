const express = require("express");

const router = express.Router();
const contacts = require("../../models/contacts");
const { nanoid } = require("nanoid");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().min(3).max(30).required(),

  phone: Joi.number().integer(),

  email: Joi.string().email({
    minDomainSegments: 2,
  }),
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
  const task = {
    id: nanoid(),
    name,
    email,
    phone,
  };

  const addContact = await contacts.addContact(task);
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
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    res.status(400).json({ message: "missing required name field" });
    return;
  }
  const task = {
    id: contactId,
    name,
    email,
    phone,
  };

  const addContact = await contacts.addContact(task);
  res.status(201).json({
    status: "success",
    code: 201,
    data: { addContact },
  });
});

module.exports = router;
