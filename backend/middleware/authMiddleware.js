const jwt = require("jsonwebtoken");
require("dotenv").config();
const db = require("../db/db"); 

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists and is not blocked
    const result = await db.query("SELECT * FROM users WHERE id = $1", [
      decoded.userId,
    ]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "User does not exist" });
    if (user.is_blocked)
      return res.status(403).json({ error: "User is blocked" });

    req.user = user; // full user from DB
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

module.exports = authenticateToken;
