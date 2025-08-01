require("dotenv").config();
const app = require("./app");
const pool = require("./db/db");
const PORT = process.env.PORT || 5000;

// Import and run createTable
const createTable = require("./createUserTable");
createTable().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
