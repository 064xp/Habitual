const jwt = require("jsonwebtoken");

module.exports = verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).json({ error: "Not authorized" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.userID = verified.id;
  } catch (err) {
    res.status(401).json({ error: "Not authorized" });
  }
  next();
};
