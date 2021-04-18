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

module.exports.removeHistoryEntry = async (userID, habitID, entryID = null) => {
  if (entryID) {
    const result = await pool.query(
      "DELETE FROM History WHERE entryID = $1 RETURNING entryID",
      [entryID]
    );
    return result.rows[0].entryid;
  } else {
    const result = await pool.query(
      `DELETE FROM History
        WHERE entryID = (SELECT entryID FROM History
                          WHERE habitID = $1
                          ORDER BY dateTime DESC
                          LIMIT 1)
        RETURNING entryID`,
      [habitID]
    );
    return result.rows[0].entryid;
  }
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

module.exports.habitBelongsTo = async (habitID, userID) => {
  try {
    const habit = await pool.query(
      "SELECT * FROM Habits WHERE habitID = $1 AND userID = $2",
      [habitID, userID]
    );
    return habit.rows.length !== 0;
  } catch (err) {
    console.log(
      `Error while validating habit ${habitID} belongs to userID ${userID}`
    );
    return null;
  }
};

module.exports.addFCMToken = async (userID, token) => {
  const res = await pool.query(
    "INSERT INTO FCMTokens (token, userID) VALUES ($1, $2)",
    [token, userID]
  );
};

module.exports.deleteFCMToken = async (token) => {
  const res = await pool.query("DELETE FROM FCMTokens WHERE token = $1", [
    token,
  ]);
};

module.exports.getUserFCMTokens = async (userID) => {
  const tokens = await pool.query(
    "SELECT token FROM FCMTokens WHERE userID = $1",
    [userID]
  );
  return tokens.rows;
};
