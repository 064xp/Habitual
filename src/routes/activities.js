const router = require("express").Router();
const verify = require("./verifyToken");
const {
  addHistoryEntry,
  removeHistoryEntry,
  getHabit,
  resetHabit,
  habitBelongsTo,
} = require("../db");

const { extractTzHeader } = require("../middleware/headerParsing");

router.post("/new", [verify, extractTzHeader], async (req, res) => {
  const { habitID, dateTime } = req.body;
  const habitBelongs = await habitBelongsTo(habitID, req.userID);

  if (!habitBelongs)
    return res.status(400).json({ error: "Habit does not exist." });

  try {
    const entryID = await addHistoryEntry(habitID, dateTime);
    const habit = await getHabit(req.userID, habitID);
    let reset = false;
    if (habit.isoverdue) reset = await resetHabit(habit);

    res.json({ status: "success", entryID: entryID, habitReset: reset });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "error", error: "Database error" });
  }
});

router.delete("/delete", [verify, extractTzHeader], async (req, res) => {
  const { habitID, entryID } = req.body;
  const habitBelongs = await habitBelongsTo(habitID, req.userID);
  if (!habitBelongs)
    return res
      .status(400)
      .json({ status: "error", error: "Habit does not exist." });

  try {
    const deletedEntry = await removeHistoryEntry(req.userID, habitID, entryID);
    return res.json({ status: "success", entryID: deletedEntry });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "error", error: "Database error" });
  }
});

module.exports = router;
