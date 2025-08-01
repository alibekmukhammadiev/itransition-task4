const express = require("express");
const pool = require("../db/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// GET /users
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, is_blocked, created_at, last_online FROM users"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /users/:id/block
router.patch("/:id/block", authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    // 1. Getting current block status
    const userResult = await pool.query(
      "SELECT is_blocked FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentStatus = userResult.rows[0].is_blocked;

    // 2. Flipping it
    const newStatus = !currentStatus;

    // 3. Updating DB
    await pool.query("UPDATE users SET is_blocked = $1 WHERE id = $2", [
      newStatus,
      userId,
    ]);

    res.status(200).json({
      message: `User ${newStatus ? 'blocked' : 'unblocked'} successfully `,
    });
  } catch (err) {
    console.error("Error toggling block status:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /users/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
