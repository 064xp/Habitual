const Pool = require("pg").Pool;
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  user: "habitualuser",
  password: process.env.DB_PASS,
  host: "localhost",
  port: 5432,
  database: "habitual",
});

module.exports.insertUser = async (user) => {
  const result = await pool.query("SELECT insertUser($1, $2, $3);", [
    user.name,
    user.email,
    user.password,
  ]);
  return result.rows[0].insertuser;
};

module.exports.emailExists = async (userEmail) => {
  const result = await pool.query("SELECT emailExists($1)", [userEmail]);
  return result.rows[0].emailexists;
};

module.exports.getUser = async (email) => {
  const result = await pool.query(
    "SELECT userId, name, email, password  FROM Users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

module.exports.getUserHabits = async (userID, ammount = 20) => {
  const result = await pool.query(
    "SELECT json_agg(h) from (SELECT * from getUserHabits($1, $2)) h",
    [userID, ammount]
  );
  return result.rows[0].json_agg;
};

module.exports.insertHabit = async (
  name,
  userID,
  frequency,
  type,
  startDate = new Date()
) => {
  const result = await pool.query("SELECT insertHabit($1, $2, $3, $4, $5)", [
    name,
    userID,
    frequency,
    type,
    startDate,
  ]);
  return result.rows[0].inserthabit;
};