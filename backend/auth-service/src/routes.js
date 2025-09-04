const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db"); // file db.js đã setup pg.Pool
const auth = require("./middleware/auth");

const router = express.Router();

/**
 * Đăng ký
 */
router.post("/register", async (req, res) => {
  const { username, password, email, first_name, last_name, phone, location } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO financial_app.users (username, password, email, first_name, last_name, phone, location, is_premium) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, username, email, is_premium`,
      [username, hashed, email, first_name, last_name, phone, location, false]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username, is_premium: user.is_premium }, process.env.JWT_SECRET || "123", {
      expiresIn: "7d",
    });

    res.json({ user, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Register failed" });
  }
});

/**
 * Đăng nhập
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(`SELECT * FROM financial_app.users WHERE username=$1`, [username]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: "Invalid username or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid username or password" });

    const token = jwt.sign({ id: user.id, username: user.username, is_premium: user.is_premium }, process.env.JWT_SECRET || "123", {
      expiresIn: "7d",
    });

    delete user.password;
    res.json({ user, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * Lấy thông tin user hiện tại
 */
router.get("/me", auth, async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, username, email, first_name, last_name, phone, location, about, company, city, state, is_premium FROM financial_app.users WHERE id=$1`, [req.user.id]);
    const user = result.rows[0];
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * Cập nhật thông tin user
 */
router.put("/update", auth, async (req, res) => {
  const fields = [
    "email", "first_name", "last_name", "phone",
    "location", "about", "company", "city", "state", "is_premium"
  ];
  const updates = [];
  const values = [];
  let idx = 1;

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      updates.push(`${f}=$${idx}`);
      values.push(req.body[f]);
      idx++;
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(req.user.id);

  const sql = `UPDATE financial_app.users SET ${updates.join(", ")} WHERE id=$${idx}`;
  try {
    await pool.query(sql, values);
    // Nếu cập nhật is_premium, trả về token mới
    if (req.body.is_premium !== undefined) {
      // Lấy lại user mới nhất
      const result = await pool.query(`SELECT id, username, is_premium FROM financial_app.users WHERE id=$1`, [req.user.id]);
      const user = result.rows[0];
      const token = jwt.sign({ id: user.id, username: user.username, is_premium: user.is_premium }, process.env.JWT_SECRET || "123", {
        expiresIn: "7d",
      });
      return res.json({ message: "Profile updated", token });
    }
    res.json({ message: "Profile updated" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

/**
 * Đổi mật khẩu
 */
router.put("/change-password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const result = await pool.query(`SELECT password FROM financial_app.users WHERE id=$1`, [req.user.id]);
    const user = result.rows[0];
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE financial_app.users SET password=$1 WHERE id=$2`, [hashed, req.user.id]);

    res.json({ message: "Password updated" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Change password failed" });
  }
});

module.exports = router;
