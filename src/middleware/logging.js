module.exports = (req, res, next) => {
  let current = new Date();
  let cTime =
    current.getHours() +
    ":" +
    current.getMinutes() +
    ":" +
    current.getSeconds();
  console.log(
    `[${cTime}] Connection from ${req.ip} ${req.method} to ${req.originalUrl}`
  );
  next();
};
