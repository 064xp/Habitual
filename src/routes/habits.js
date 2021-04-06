const router = require("express").Router();
const verify = require("./verifyToken");
const db = require("../db");
const { validateHabit } = require("../validation");

router.post("/new", verify, async (req, res) => {
  const { name, frequency, type, startDate, reminder } = req.body;
  const { error } = validateHabit(req.body);

  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const habitID = await db.insertHabit(
      name,
      req.userID,
      frequency,
      type,
      reminder,
      startDate
    );
    res.json({ status: "success", habitID: habitID });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ status: "error", error: err.message });
  }
});

router.get("/", verify, async (req, res) => {
  const habits = await db.getUserHabits(req.userID, req.body.ammount);
  res.json({ status: "success", habits: habits });
});

module.exports = router;
