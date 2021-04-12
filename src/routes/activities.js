const router = require("express").Router();
const verify = require("./verifyToken");
const { addHistoryEntry, getHabit, resetHabit } = require("../db");

const { extractTzHeader } = require("../middleware/headerParsing");

router.post("/new", [verify, extractTzHeader], async (req, res) => {
  const { habitID, dateTime } = req.body;
  try {
    const entryID = await addHistoryEntry(habitID, dateTime);
    const habit = await getHabit(req.userID, habitID);
    let reset = false;
    if (habit.isoverdue) reset = await resetHabit(habit);

    res.json({ status: "success", entryID: entryID, habitReset: reset });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ status: "error", error: err.message });
  }
});

module.exports = router;
