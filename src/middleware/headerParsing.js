module.exports.extractTzHeader = (req, res, next) => {
  console.log(req.headers.tz_offset);
  next();
};
