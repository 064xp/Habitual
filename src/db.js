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

module.exports.getHabit = async (habitID) => {
  const result = await pool.query(
    "SELECT json_agg(h) from (SELECT * FROM Habits WHERE habitid = $1) h",
    [habitID]
  );
  return result.rows[0].json_agg[0];
};

module.exports.insertHabit = async (
  name,
  userID,
  frequency,
  type,
  reminder,
  startDate = new Date()
) => {
  const result = await pool.query(
    "SELECT insertHabit($1, $2, $3, $4, $5, $6)",
    [
      name, //1
      userID, //2
      frequency, //3
      type, //4
      reminder, //5
      startDate, //6
    ]
  );
  return result.rows[0].inserthabit;
};

module.exports.updateHabit = async (
  habitID,
  name,
  frequency,
  type,
  reminder
) => {
  const result = await pool.query("SELECT updateHabit($1, $2, $3, $4, $5)", [
    habitID,
    name,
    frequency,
    type,
    reminder,
  ]);
  return result.rows[0].updatehabit;
};

module.exports.deleteHabit = async (userID, habitID) => {
  const result = await pool.query("SELECT deleteHabit($1, $2)", [
    userID,
    habitID,
  ]);
  return result.rows[0].deletehabit;
};
