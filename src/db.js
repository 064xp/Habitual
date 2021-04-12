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

module.exports.pool = pool;

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

module.exports.updateTimezone = async (userID, newTzOffset) => {
  const currentOffset = await pool.query(
    "SELECT tzoffset FROM Users WHERE userID = $1",
    [userID]
  );
  if (currentOffset.rows[0] !== newTzOffset) {
    try {
      await pool.query("UPDATE Users SET tzoffset = $1 WHERE userID = $2", [
        newTzOffset,
        userID,
      ]);
    } catch (e) {
      console.log(`Error updating timezone for user ${userID}`);
      console.log(e);
    }
  }
};

module.exports.getUserHabits = async (userID, ammount = null) => {
  const result = await pool.query(
    "SELECT json_agg(h) from (SELECT * from getUserHabits($1, $2)) h",
    [userID, ammount]
  );
  return result.rows[0].json_agg;
};

module.exports.getHabit = async (userID, habitID) => {
  const result = await pool.query(
    "SELECT json_agg(h) from (SELECT * FROM Habits WHERE habitid = $1 and userID = $2) h",
    [habitID, userID]
  );
  return result.rows[0].json_agg ? result.rows[0].json_agg[0] : null;
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
  userID,
  habitID,
  name,
  frequency,
  type,
  reminder
) => {
  const result = await pool.query(
    "SELECT updateHabit($1, $2, $3, $4, $5, $6)",
    [userID, habitID, name, frequency, type, reminder]
  );
  return result.rows[0].updatehabit;
};

module.exports.deleteHabit = async (userID, habitID) => {
  const result = await pool.query("SELECT deleteHabit($1, $2)", [
    userID,
    habitID,
  ]);
  return result.rows[0].deletehabit;
};

module.exports.setHabitOverdue = async (habitID) => {
  const result = await pool.query("CALL setHabitOverdue($1)", [habitID]);
  return result;
};

module.exports.addHistoryEntry = async (habitID, dateTime = new Date()) => {
  const result = await pool.query("SELECT insertHistoryEntry($1, false, $2)", [
    habitID,
    dateTime,
  ]);
  return result.rows[0].inserthistoryentry;
};

module.exports.resetHabit = async (habit) => {
  try {
    const typeQuery = await pool.query(
      "SELECT days FROM habitTypes WHERE typeID = $1",
      [habit.type]
    );
    const typeDays = typeQuery.rows[0].days;

    const result = await pool.query(
      "UPDATE Habits SET startDate = NOW(), daysPending = $1, isOverdue = false WHERE habitID = $2",
      [typeDays, habit.habitid]
    );
    return true;
  } catch (err) {
    console.log(`Error while reseting habit ${habit.habitid}`);
    console.log(err);
    return false;
  }
};
