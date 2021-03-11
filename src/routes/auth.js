const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { insertUser, emailExists, getUser } = require("../db.js");
const { validateUser } = require("../validation.js");

router.post("/signup", async (req, res) => {
  let newUser = { ...req.body };
  // Validate data
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // Check if email already exists
  const exists = await emailExists(newUser.email);
  if (exists) return res.status(400).json({ error: "Email is already in use" });

  // Hashing the password
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(req.body.password, salt);

  // Insert into DB
  try {
    const userId = await insertUser(newUser);
    return res.json({ userId: userId });
  } catch (e) {
    console.log(e);
    return res.status(500).send("Database error");
  }
});

router.post("/login", async (req, res) => {
  const exists = await emailExists(req.body.email);
  if (!exists) return res.status(400).json({ error: "Invalid credentials" });

  const user = await getUser(req.body.email);
  const validPass = await bcrypt.compare(req.body.password, user.password);

  if (!validPass) res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.userid }, process.env.JWT_SECRET);
  res
    .cookie("authToken", token, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV == "production" ? true : false,
    })
    .json({ status: "success", token: token });
});

module.exports = router;
