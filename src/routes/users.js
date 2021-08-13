const router = require("express").Router();
const verify = require("./verifyToken");
const db = require("../db");
const { validateHabit } = require("../utils/validation");

router.post("/fcm-token", verify, async (req, res) => {
  const { token } = req.body;

  try {
    await db.addFCMToken(req.userID, token);
    res.json({ status: "success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "error" });
  }
});

router.delete("/fcm-token", verify, async (req, res) => {
  const { token } = req.body;

  try {
    await db.deleteFCMToken(token);
    res.json({ status: "success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "error" });
  }
});

module.exports = router;
