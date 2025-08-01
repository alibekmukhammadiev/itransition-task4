const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db/db");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const router = express.Router();

// POST /register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // 1. Checking if user already exists
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hashing the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Inserting new user
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /login

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Checking if user exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // 2. Checking if user is blocked or not
    if (user.is_blocked) {
      return res.status(403).json({ error: "User is blocked" });
    }

    // 3. Check password WARNING HERE!!!!
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Creating jwt token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 5. Updating last_online feature

    await pool.query("UPDATE users SET last_online = NOW() WHERE id = $1", [
      user.id,
    ]);

    //  6. Sending token to client
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

module.exports = router;
