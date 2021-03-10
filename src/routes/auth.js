const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { insertUser } = require("../db.js");
const { validateUser } = require("../validation.js");

router.post("/sign-up", async (req, res) => {
  let newUser = { ...req.body };
  // Validate data
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Hashing the password
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(req.body.password, salt);

  // Insert into DB
  try {
    const userId = await insertUser(newUser);
    return res.json({ userId: userId });
  } catch (e) {
    //email already in use
    if (e.code === "23505") {
      return res.status(400).send(e.message);
    }
    console.log(e);
    return res.status(500).send("Database error");
  }
});

module.exports = router;
