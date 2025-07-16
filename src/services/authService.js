require("dotenv").config();
const db = require("../models/db");
const { createToken } = require("../utils/jwt");
const bcrypt = require("bcrypt");

// --- Register User ---
const registerUser = async ({ email, password, username }) => {
  const existing = await db.query(`SELECT id FROM users WHERE email = $1`, [
    email,
  ]);
  if (existing.rowCount > 0) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const res = await db.query(
    `INSERT INTO users (email, password_hash, username)
     VALUES ($1, $2, $3)
     RETURNING id, email, username, avatar_url`,
    [email, passwordHash, username]
  );

  const user = res.rows[0];

  const token = createToken({ userId: user.id, email: user.email });

  return {
    message: "Registration successful",
    token,
    user,
  };
};

// --- Login User ---
const loginUser = async ({ email, password }) => {
  const res = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = res.rows[0];
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid password");

  const token = createToken({ userId: user.id, email: user.email });

  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar_url: user.avatar_url,
    },
  };
};

// --- Logout ---
const logout = async (token) => {
  await db.query(`INSERT INTO token_blacklist (token) VALUES ($1)`, [token]);
  return { message: "Logout successful" };
};

// --- Helper: Check if token is blacklisted ---
const isTokenBlacklisted = async (token) => {
  const res = await db.query(
    `SELECT 1 FROM token_blacklist WHERE token = $1 LIMIT 1`,
    [token]
  );
  return res.rowCount > 0;
};

module.exports = {
  registerUser,
  loginUser,
  logout,
  isTokenBlacklisted,
};
