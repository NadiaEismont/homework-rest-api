const express = require("express");
const fs = require("fs").promises;
const gravatar = require("gravatar");
const Jimp = require("jimp");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { nanoid } = require("nanoid");
const path = require("path");

const { uploadDir, storeImage } = require("../common");
const { auth } = require("../middleware/auth");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/sendEmail");

const schema = Joi.object({
  password: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
});

const schemaVerify = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .required(),
});

const router = express.Router();

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

  const avatarURL = gravatar.url(email, { protocol: "https", s: "100" });
  const verificationToken = nanoid();

  const addUser = new User({ email, avatarURL, verificationToken });
  addUser.setPassword(password);
  await addUser.save();

  sendVerificationEmail(email, verificationToken);

  res.status(201).json({
    user: {
      email: email,
      subscription: "starter",
    },
  });
});

router.post("/users/verify", async (req, res, next) => {
  const { value, error } = schemaVerify.validate(req.body);
  if (error) {
    res.status(400).json({ message: "missing required field email" });
    return;
  }
  const email = value.email;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (user.verify) {
    res.status(400).json({
      message: "Verification has already been passed",
    });
    return;
  }

  sendVerificationEmail(email, user.verificationToken);

  res.status(200).json({
    message: "Verification email sent",
  });
});

router.get("/users/verify/:verificationToken", async (req, res, next) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  user.verificationToken = null;
  user.verify = true;
  await user.save();
  res.status(200).json({
    message: "Verification successful",
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
  if (!user) {
    res.status(404).json({ message: "User not found" });
  }
  if (user.validPassword(password)) {
    if (!user.verify) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const payload = { id: user.id, email: user.email, subscription: user.subscription };
    const { ACCESS_TOKEN_SECRET } = process.env;
    const token = jwt.sign(payload, ACCESS_TOKEN_SECRET);

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

router.get("/users/current", auth, async (req, res, next) => {
  res.status(200).json({
    user: {
      email: req.user.email,
      subscription: req.user.subscription,
    },
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 1048576,
  },
});

const upload = multer({
  storage: storage,
});

router.patch("/users/avatars", auth, upload.single("avatar"), async (req, res, next) => {
  const { path: temporaryName } = req.file;
  const uniqueAvatarName = nanoid() + ".jpg";
  const fileName = path.join(storeImage, uniqueAvatarName);
  try {
    const avatar = await Jimp.read(temporaryName);
    avatar.resize(250, 250); // resize
    await avatar.writeAsync(temporaryName); // save

    await fs.rename(temporaryName, fileName);
  } catch (err) {
    await fs.unlink(temporaryName);
    return next(err);
  }

  // save to DB
  const avatarURL = `localhost:3000/avatars/${uniqueAvatarName}`;
  req.user.avatarURL = avatarURL;
  await req.user.save();

  res.status(200).json({ avatarURL });
});

module.exports = router;
