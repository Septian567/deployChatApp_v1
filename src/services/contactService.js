const db = require("../models/db");

const getAllContacts = async (userId) => {
  const res = await db.query(
    `SELECT u.id, u.username, u.avatar_url, u.email, c.alias, c.created_at
     FROM contacts c
     JOIN users u ON u.id = c.contact_id
     WHERE c.user_id = $1`,
    [userId]
  );
  return res.rows;
};

const getContactById = async (userId, contactId) => {
  const res = await db.query(
    `SELECT u.id, u.username, u.avatar_url, u.email, c.alias, c.created_at
     FROM contacts c
     JOIN users u ON u.id = c.contact_id
     WHERE c.user_id = $1 AND c.contact_id = $2`,
    [userId, contactId]
  );
  return res.rows[0];
};

const getContactByUsername = async (userId, contactUsername) => {
  const res = await db.query(
    `SELECT u.id, u.username, u.avatar_url, u.email, c.alias, c.created_at
     FROM contacts c
     JOIN users u ON u.id = c.contact_id
     WHERE c.user_id = $1 AND u.username = $2`,
    [userId, contactUsername]
  );
  return res.rows[0];
};

const createContact = async ({ userId, contactId, alias }) => {
  const result = await db.query(
    `INSERT INTO contacts (user_id, contact_id, alias)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, contactId, alias]
  );
  return result.rows[0];
};

const updateContact = async ({ userId, contactId, alias }) => {
  const result = await db.query(
    `UPDATE contacts
     SET alias = $1
     WHERE user_id = $2 AND contact_id = $3
     RETURNING *`,
    [alias, userId, contactId]
  );
  return result.rows[0];
};

const deleteContact = async (userId, contactId) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(userId) || !uuidRegex.test(contactId)) {
    throw new Error("Format ID tidak valid");
  }

  const result = await db.query(
    `DELETE FROM contacts 
     WHERE user_id = $1 AND contact_id = $2
     RETURNING user_id, contact_id`,
    [userId, contactId]
  );

  return {
    success: result.rowCount > 0,
    deletedData: result.rows[0] || null,
  };
};

const getContactByUserIdAndContactId = async (userId, contactId) => {
  const result = await db.query(
    `SELECT * FROM contacts WHERE user_id = $1 AND contact_id =$2`,
    [userId, contactId]
  );
  return result.rows[0];
};

module.exports = {
  getAllContacts,
  getContactById,
  getContactByUsername,
  createContact,
  updateContact,
  deleteContact,
  getContactByUserIdAndContactId,
};
