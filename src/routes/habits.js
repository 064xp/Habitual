const router = require("express").Router();
const verify = require("./verifyToken");
const db = require("../db");
const { validateHabit } = require("../validation");
const { extractTzHeader } = require("../middleware/headerParsing");

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

router.get("/", [verify, extractTzHeader], async (req, res) => {
  try {
    const habits = await db.getUserHabits(req.userID, req.body.ammount);
    res.json({ status: "success", habits: habits });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error" });
  }
});

router.get("/:habitID", verify, async (req, res) => {
  try {
    const habit = await db.getHabit(req.userID, req.params.habitID);
    if (!habit)
      return res
        .status(400)
        .json({ status: "error", message: "Habit does not exist" });
    return res.json({ status: "success", habit: habit });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error" });
  }
});

router.put("/update/:habitID", verify, async (req, res) => {
  const { name, type, frequency, reminder } = req.body;
  const { error } = validateHabit(req.body);

  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const habit = await db.updateHabit(
      req.userID,
      req.params.habitID,
      name,
      frequency,
      type,
      reminder
    );

    res.json({ status: "success", message: "Updated habitID " + habit });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error" });
  }
});

router.delete("/:habitID", verify, async (req, res) => {
  try {
    const habit = await db.deleteHabit(req.userID, req.params.habitID);

    res.json({ status: "success", message: "Deleted habitID " + habit });
  } catch (e) {
    console.log(e);
    res.status(500).json({ status: "error" });
  }
});

module.exports = router;
