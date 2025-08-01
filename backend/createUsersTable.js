const pool = require("./db/db");

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_blocked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_online TIMESTAMP
      )
    `);
    console.log("Users table ensured.");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
};

module.exports = createTable;

