const db = require("../models/db");

// Kirim pesan
const sendMessage = async ({
  fromUserId,
  toUserId,
  messageText,
  attachments = [],
}) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const messageRes = await client.query(
      `INSERT INTO messages (from_user_id, to_user_id, message_text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [fromUserId, toUserId, messageText]
    );

    const message = messageRes.rows[0];

    await client.query(
      `INSERT INTO message_user_visibility (message_id, user_id) 
       VALUES ($1, $2), ($1, $3)`,
      [message.message_id, fromUserId, toUserId]
    );

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {

        await client.query(
          `INSERT INTO message_attachments 
            (message_id, media_type, media_url, media_name, media_size)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            message.message_id,
            attachment.mediaType,
            attachment.mediaUrl,
            attachment.mediaName,
            attachment.mediaSize,
          ]
        );
      }

    }

    await client.query("COMMIT");

    return {
      ...message,
      attachments,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getMessageById = async (messageId) => {
  const result = await db.query(
    `SELECT * FROM messages WHERE message_id = $1`,
    [messageId]
  );
  return result.rows[0];
};

// Ambil semua pesan antara user dan kontak (2 arah)
const getMessagesBetween = async (userId, contactId) => {
  const result = await db.query(
    `SELECT m.*, v.is_visible, v.hidden_at, m.is_deleted
    FROM messages m
    JOIN message_user_visibility v ON v.message_id = m.message_id
    WHERE
    ((m.from_user_id = $1 AND m.to_user_id =$2)
    OR (m.from_user_id = $2 AND m.to_user_id =$1))
    AND v.user_id = $1
    AND v.is_visible = true
    ORDER BY m.created_at ASC,
    m.message_id ASC`,
    [userId, contactId]
  );

  return result.rows.map((msg) => ({
    message_id: msg.message_id,
    from_user_id: msg.from_user_id,
    to_user_id: msg.to_user_id,
    message_text: msg.is_deleted ? "pesan ini sudah dihapus" : msg.message_text,
    is_deleted: msg.is_deleted,
    is_visible: msg.is_visible,
    hidden_at: msg.hidden_at,
    created_at: msg.created_at,
    read_at: msg.read_at,
    updated_at: msg.updated_at,
  }));
};

// Ambil pesan terakhir untuk semua kontak user
const getLatestMessagesByUser = async (userId) => {
  const result = await db.query(
    `
    SELECT DISTINCT ON (to_contact_id) *
    FROM messages
    WHERE from_user_id = $1 OR to_contact_id = $1
    ORDER BY to_contact_id, created_at DESC
    `,
    [userId]
  );
  return result.rows;
};

// Tandai pesan sebagai sudah dibaca
const markMessageAsRead = async (messageId) => {
  const result = await db.query(
    `UPDATE messages
     SET read_at = NOW()
     WHERE message_id = $1
     RETURNING *`,
    [messageId]
  );
  return result.rows[0];
};

const updateMessageText = async (messageId, newText) => {
  const result = await db.query(
    `UPDATE messages SET message_text = $1, updated_at = NOW()
     WHERE message_id = $2 RETURNING *`,
    [newText, messageId]
  );
  return result.rows[0];
};

const deleteMessage = async (messageId) => {
  const result = await db.query(
    `UPDATE messages SET is_deleted = true, deleted_at = NOW()
     WHERE message_id = $1 RETURNING *`,
    [messageId]
  );
  return result.rows[0];
};

const deleteConversationBetween = async (fromUserId, toContactId) => {
  const result = await db.query(
    `SELECT message_id FROM messages WHERE (from_user_id = $1 AND to_user_id =$2) OR (from_user_id = $2 AND to_user_id = $1)`,
    [fromUserId, toContactId]
  );

  const messageIds = result.rows.map((row) => row.message_id);
  if (messageIds.length === 0) return [];

  await db.query(
    `UPDATE message_user_visibility SET is_visible = false, hidden_at = NOW() WHERE message_id = ANY($1) AND user_id = $2`,
    [messageIds, fromUserId]
  );

  return messageIds;
};

const deleteMessageForUser = async (userId, messageId) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Update visibility
    const result = await client.query(
      `UPDATE message_user_visibility 
       SET is_visible = false, hidden_at = NOW() 
       WHERE message_id = $1 AND user_id = $2 
       RETURNING *`,
      [messageId, userId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return null; // Tidak ditemukan
    }

    // Cek apakah semua user sudah sembunyikan pesan
    const visibilityCheck = await client.query(
      `SELECT COUNT(*) AS visible_count 
       FROM message_user_visibility 
       WHERE message_id = $1 AND is_visible = true`,
      [messageId]
    );

    const visibleCount = parseInt(visibilityCheck.rows[0].visible_count, 10);

    if (visibleCount === 0) {
      // Semua user sudah sembunyikan pesan, hapus permanen
      await client.query(
        `DELETE FROM message_user_visibility WHERE message_id = $1`,
        [messageId]
      );
      await client.query(`DELETE FROM messages WHERE message_id = $1`, [messageId]);
    }

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};


module.exports = {
  sendMessage,
  getMessagesBetween,
  getLatestMessagesByUser,
  markMessageAsRead,
  updateMessageText,
  deleteMessage,
  deleteConversationBetween,
  deleteMessageForUser,
  getMessageById,
};
