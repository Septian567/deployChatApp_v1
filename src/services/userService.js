const db = require("../models/db");

// --- Ambil user berdasarkan ID ---
const getUserById = async (userId) => {
  const res = await db.query(
    `SELECT id, username, email, avatar_url FROM users WHERE id = $1`,
    [userId]
  );
  return res.rows[0];
};

// --- Ambil user berdasarkan username ---
const getUserByUsername = async (username) => {
  const res = await db.query(`SELECT * FROM users WHERE username = $1`, [
    username,
  ]);
  return res.rows[0];
};

// --- Update data user ---
const updateUser = async (userId, { username, email, avatarUrl }) => {
  const res = await db.query(
    `UPDATE users
     SET username = $1,
         email = $2,
         avatar_url = COALESCE($3, avatar_url),
         updated_at = NOW()
     WHERE id = $4
     RETURNING id, username, email, avatar_url`,
    [username, email, avatarUrl, userId]
  );
  return res.rows[0];
};

// --- Ambil semua user ---
const getAllUsers = async () => {
  const res = await db.query(
    `SELECT id, username, email, avatar_url FROM users ORDER BY created_at DESC`
  );
  return res.rows;
};

// --- Cari user berdasarkan query ---
const searchUsers = async (query) => {
  const res = await db.query(
    `SELECT id, username, email, avatar_url 
     FROM users 
     WHERE username ILIKE $1 OR email ILIKE $1 
     ORDER BY created_at DESC`,
    [`%${query}%`]
  );
  return res.rows;
};

module.exports = {
  getUserById,
  getUserByUsername,
  updateUser,
  getAllUsers,
  searchUsers,
};
