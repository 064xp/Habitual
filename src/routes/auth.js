const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { insertUser, emailExists } = require("../db.js");
const { validateUser } = require("../validation.js");

router.post("/sign-up", async (req, res) => {
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

module.exports = router;
