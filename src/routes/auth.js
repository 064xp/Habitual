const router = require("express").Router();
const { insertUser } = require("../db.js");
const { validateUser } = require("../validation.js");

router.post("/sign-up", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const userId = await insertUser(req.body);
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
