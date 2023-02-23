const express = require("express");

const router = express.Router();
const contacts = require("../../models/contacts");
const nanoid = require("nanoid").nanoid;

router.get("/", async (req, res, next) => {
  const list = contacts.listContacts();
  res.json({
    status: "success",
    code: 200,
    data: list,
  });
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;

  const contactById = contacts.getContactById(contactId);

  res.json({
    status: "success",
    code: 200,
    data: { contactById },
  });
});

router.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    res.status(400).json({ message: "missing required name field" });
    return;
  }
  const task = {
    id: nanoid(),
    name,
    email,
    phone,
  };

  const addContact = contacts.addContact(task);
  res.status(201).json({
    status: "success",
    code: 201,
    data: { addContact },
  });
});

router.delete("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

router.put("/:contactId", async (req, res, next) => {
  res.json({ message: "template message" });
});

module.exports = router;
