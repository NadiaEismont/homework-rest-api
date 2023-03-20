const express = require("express");
const router = express.Router();
const contacts = require("../../models/contacts");
const { schema, schemaFav } = require("./contactsValidator");

router.post("/users/register", async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = schema.validate({ email, password });
  if (error) {
    res.status(400).json({ message: "missing required name field" });
    return;
  }
  const addUser = await contacts.addUser({ email, password });
  res.status(201).json({
    user: {
      email: email,
      subscription: "starter",
    },
  });
});
