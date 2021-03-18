const router = require("express").Router();
const verify = require("./verifyToken");
const db = require("../db");

router.post("/new", verify, async (req, res) => {
  const { name, frequency, type, startDate } = req.body;
  try {
    const habitID = await db.insertHabit(
      name,
      req.userID,
      frequency,
      type,
      startDate
    );
    res.json({ status: "success", habitID: habitID });
  } catch (err) {
    return res.status(400).json({ status: "error", error: err.message });
  }
});

module.exports = router;
