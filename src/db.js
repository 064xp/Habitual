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
