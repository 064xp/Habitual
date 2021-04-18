const { promisify } = require("util");
const { pool, setHabitOverdue, getUserFCMTokens } = require("../db");
const { sendNotification } = require("../firebase/notifications");
const Cursor = require("pg-cursor");

Cursor.prototype.readAsync = promisify(Cursor.prototype.read);

module.exports = async () => {
  const client = await pool.connect();
  const cursor = client.query(new Cursor("SELECT * FROM notificationHabits;"));
  while (true) {
    let habit = await cursor.readAsync(1);
    if (habit.length === 0) break;
    habit = habit[0];
    let userFCMTokens = await getUserFCMTokens(habit.userid);
    userFCMTokens = userFCMTokens.map((tokenObj) => tokenObj.token);

    sendNotification(
      userFCMTokens,
      "Notificación de Habitual",
      `Es hora de ${habit.name}!`
    );
  }

  cursor.close(() => {
    client.release();
  });
};
