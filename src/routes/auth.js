const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const { sendMail } = require("../utils/mailer");
const {
  insertUser,
  emailExists,
  getUser,
  updateTimezone,
  addRecoveryCode,
  getRecoveryEntry,
  changeUserPassword
} = require("../db.js");
const { validateUser } = require("../utils/validation.js");
const { generateCode } = require("../utils/helperFunctions.js");
const verify = require("./verifyToken");

router.post("/signup", async (req, res) => {
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

router.post("/login", async (req, res) => {
  const exists = await emailExists(req.body.email);
  if (!exists) return res.status(401).json({ error: "Invalid credentials" });

  const user = await getUser(req.body.email);
  const validPass = await bcrypt.compare(req.body.password, user.password);

  if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.userid }, process.env.JWT_SECRET);
  res
    .cookie("authToken", token, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV == "production" ? true : false,
      sameSite: "strict"
    })
    .json({
      status: "success",
      token: token,
      name: user.name,
      email: user.email
    });

  updateTimezone(user.userid, req.headers.tz_offset);
});

router.get("/verifyToken", verify, (req, res) => {
  res.json({ status: "success", userID: req.userID });
});

router.post("/logout", verify, (req, res) => {
  res.clearCookie("authToken");
  res.json({ status: "logged out" });
});

router.post("/passwordReset", async (req, res) => {
  const exists = await emailExists(req.body.email);
  if (exists) {
    try {
      const user = await getUser(req.body.email);
      const code = uuid.v4();
      await addRecoveryCode(user.userid, code);

      const resetLink =
        process.env.DOMAIN + `/passwordResetForm.html?recoveryCode=${code}`;
      const emailBody = `
      <img src="https://i.imgur.com/Bow93vn.png" alt="Habitual"/>
      <h1>Reestablece tu contraseña de Habitual</h1>
      <h2 style="font-weight: normal;">Da click en este link ${resetLink} para reestablecer tu contraseña</h2>
      <p><em>Si no solicitaste un cambio de contraseña, por favor, ignora esta notificación</em></p>
    `;

      await sendMail(
        req.body.email,
        "Reestablece tu contraseña de Habitual",
        emailBody,
        true
      );
      return res.json({ status: "success" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ status: "failed" });
    }
  }
});

router.post("/validateRecoveryCode", async (req, res) => {
  const recoveryCode = req.body.code;
  const recoveryEntry = await getRecoveryEntry(recoveryCode);
  if (recoveryEntry === undefined) {
    return res
      .status(401)
      .json({ status: "failed", error: "Recovery code is not valid" });
  }

  const now = new Date();
  // If code was generated more than 5 minutes ago
  if ((now - recoveryEntry.created) / 1000 / 60 > 5) {
    return res
      .status(410)
      .json({ status: "failed", error: "Recovery code has expired" });
  }
  return res.json({ status: "success", error: "Recovery code is valid" });
});

router.post("/resetPassword", async (req, res) => {
  const recoveryCode = req.body.code;
  const password = req.body.password;
  const passwordConf = req.body.passwordConf;

  const recoveryEntry = await getRecoveryEntry(recoveryCode);
  if (recoveryEntry === undefined) {
    return res
      .status(401)
      .json({ status: "failed", error: "Recovery code is not valid" });
  }

  if (password !== passwordConf) {
    return res
      .status(400)
      .json({ status: "failed", error: "Passwords do not match" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    await changeUserPassword(recoveryEntry.userid, hashed);
    return res.json({
      status: "sucess",
      error: "Password updated succesfully"
    });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: "failed", error: "Error while updating the password" });
  }
});

module.exports = router;
