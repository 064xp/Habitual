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

router.get("/", verify, async (req, res) => {
  const habits = await db.getUserHabits(req.userID, req.body.ammount);
  res.json({ status: "success", habits: habits });
});

module.exports = router;
