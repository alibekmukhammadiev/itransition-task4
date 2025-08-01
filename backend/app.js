const express = require("express");
const app = express();
const cors = require("cors");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");

app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/users", usersRoutes);

module.exports = app;
