const { updateTimezone } = require("../db");
module.exports.extractTzHeader = async (req, res, next) => {
  const tzOffset = parseInt(req.headers.tz_offset);
  if (!isNaN(tzOffset)) await updateTimezone(req.userID, parseInt(tzOffset));
  next();
};
