const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { auth } = require("../middleware/auth");
const User = require("../models/modelUsers");

const schema = Joi.object({
  password: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
});

router.post("/users/register", async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = schema.validate({ email, password });
  if (error) {
    res.status(400).json(error);
    return;
  }
  const user = await User.findOne({ email });
  if (user) {
    res.status(409).json({ message: "Email in use" });
    return;
  }

  const addUser = new User({ email });
  addUser.setPassword(password);
  await addUser.save();
  res.status(201).json({
    user: {
      email: email,
      subscription: "starter",
    },
  });
});

router.post("/users/login", async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = schema.validate({ email, password });
  if (error) {
    res.status(400).json(error);
    return;
  }
  const user = await User.findOne({ email });
  if (user) {
    res.status(409).json({ message: "Email in use" });
  }
  if (user.validPassword(password)) {
    // створення токена

    const payload = { email: user.email, subscription: user.subscription };
    const secret = "secret word";
    const token = jwt.sign(payload, secret);

    user.token = token;
    await user.save();
    res.status(200).json({
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } else {
    res.status(401).json({
      message: "Email or password is wrong",
    });
  }
});

router.post("/users/logout", auth, async (req, res, next) => {
  req.user.token = null;
  await req.user.save();
  res.status(204);
});

router.post("/users/current", auth, async (req, res, next) => {
  res.status(200).json({
    user: {
      email: req.user.email,
      subscription: req.user.subscription,
    },
  });
});

module.exports = router;
