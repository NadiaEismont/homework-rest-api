const nanoid = require("nanoid").nanoid;

const fs = require("fs").promises;
const path = require("path");

const contactsPath = path.join(__dirname, "models", "contacts.json");

const useContacts = async function () {
  let data = await fs.readFile(contactsPath, "utf8");

  const result = JSON.parse(data);
  return result;
};

const listContacts = async () => {
  const result = await useContacts();
  return result;
};

const getContactById = async (contactId) => {
  const data = await useContacts();
  const result = data.find((data) => data.id === contactId.toString());
  return result;
};

const removeContact = async (contactId) => {};

const addContact = async (body) => {};

const updateContact = async (contactId, body) => {};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
