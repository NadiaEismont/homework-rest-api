const contacts = require("../models/contacts");
const { schema, schemaFav } = require("./contactsValidator");

exports.listContacts = async (req, res, next) => {
  const list = await contacts.listContacts();
  res.json({
    status: "success",
    code: 200,
    data: list,
  });
};

exports.getContactById = async (req, res, next) => {
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
};

exports.createContact = async (req, res, next) => {
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
};

exports.deleteContact = async (req, res, next) => {
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
};

exports.updateContact = async (req, res, next) => {
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
};

exports.setFav = async (req, res, next) => {
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
};
