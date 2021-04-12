const { promisify } = require("util");
const { pool, setHabitOverdue } = require("../db");
const Cursor = require("pg-cursor");

Cursor.prototype.readAsync = promisify(Cursor.prototype.read);

module.exports = async () => {
  const finished = false;
  const client = await pool.connect();
  const cursor = client.query(new Cursor("SELECT * FROM overdueHabits;"));

  while (true) {
    try {
      let habit = await cursor.readAsync(1);
      if (habit.length == 0) break;
      const { habitid } = habit[0];

      try {
        const res = await setHabitOverdue(habitid);
      } catch (err) {
        console.log(`error while setting habitID ${habitid} to overdue`);
        console.log(err);
      }
    } catch (e) {
      console.log("[!] Error in check overdue habits query");
      console.log(e);
      break;
    }
  }

  cursor.close(() => {
    client.release();
  });
};
