require("dotenv").config();

const { Pool } = require("pg");
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

pool
  .connect()
  .then(() => console.log("Connected"))
  .catch((err) => console.error("Error"));

module.exports = pool;
