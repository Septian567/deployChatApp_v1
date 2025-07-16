const db = require("../models/db");

const findOrCreateChat = async (user1Id, user2Id) => {
  // Sort user IDs to ensure uniqueness
  const [a, b] = [user1Id, user2Id].sort();
  const existing = await db.query(
    `SELECT * FROM chats WHERE user1_id = $1 AND user2_id = $2`,
    [a, b]
  );

  if (existing.rows.length > 0) return existing.rows[0];

  const res = await db.query(
    `INSERT INTO chats (user1_id, user2_id) VALUES ($1, $2) RETURNING *`,
    [a, b]
  );

  return res.rows[0];
};

const getUserChats = async (userId) => {
  const res = await db.query(
    `SELECT * FROM chats WHERE user1_id = $1 OR user2_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return res.rows;
};

const sendMessage = async ({ chatId, senderId, content }) => {
  const res = await db.query(
    `INSERT INTO messages (chat_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [chatId, senderId, content]
  );
  return res.rows[0];
};

const getMessages = async (chatId) => {
  const res = await db.query(
    `SELECT * FROM messages WHERE chat_id = $1 AND deleted = false ORDER BY created_at ASC`,
    [chatId]
  );
  return res.rows;
};

const checkChatExists = async (user1Id, user2Id) => {
  const [a, b] = [user1Id, user2Id].sort();

  const res = await db.query(
    `SELECT * FROM chats WHERE user1_id = $1 AND user2_id = $2`,
    [a, b]
  );

  return res.rows[0] || null;
};

const getContactByUserIdAndContactId = async (userId, contactUserId) => {
  const res = await db.query(
    `SELECT * FROM contacts WHERE user_id = $1 AND contact_id = $2`,
    [userId, contactUserId]
  );
  return res.rows[0];
};


module.exports = {
  findOrCreateChat,
  getUserChats,
  sendMessage,
  getMessages,
  checkChatExists,
  getContactByUserIdAndContactId
};
