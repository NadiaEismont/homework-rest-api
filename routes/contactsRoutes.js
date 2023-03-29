const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

const {
  listContacts,
  getContactById,
  createContact,
  deleteContact,
  updateContact,
  setFav,
} = require("../controllers/contactsControllers");

router.get("/", listContacts);

router.get("/:contactId", auth, getContactById);

router.post("/", createContact);

router.delete("/:contactId", auth, deleteContact);

router.put("/:contactId", auth, updateContact);

router.patch("/:contactId/favorite", auth, setFav);

module.exports = router;
