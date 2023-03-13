const nanoid = require("nanoid").nanoid;
const mongoose = require("mongoose");

const fs = require("fs").promises;
const path = require("path");

const contactsPath = path.join(__dirname, "models", "contacts.json");

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

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

async function removeContact(contactId) {
  const data = await useContacts();
  const result = data.filter((data) => data.id !== contactId);
  const newList = JSON.stringify(result);

  try {
    await fs.writeFile(contactsPath, newList, { encoding: "utf8", flag: "w" });
  } catch (error) {
    console.error(error);
  }
}

const addContact = async (body) => {
  const data = await useContacts();
  data.push(body);

  const newList = JSON.stringify(data);

  try {
    await fs.writeFile(contactsPath, newList, { encoding: "utf8", flag: "w" });
  } catch (error) {
    console.error(error);
  }
};

const updateContact = async (contactId, body) => {};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
