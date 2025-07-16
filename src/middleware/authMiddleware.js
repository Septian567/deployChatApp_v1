const db = require("../models/db");
const { verifyToken } = require("../utils/jwt");

// Cek apakah token sudah di-blacklist
const isTokenBlacklisted = async (token) => {
  const res = await db.query(
    `SELECT 1 FROM token_blacklist WHERE token = $1 LIMIT 1`,
    [token]
  );
  return res.rowCount > 0;
};

const requireAuth = async (request, h) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return h
      .response({ error: "Missing or invalid token" })
      .code(401)
      .takeover();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    // 🔒 Cek apakah token ada di blacklist
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return h
        .response({ error: "Token has been logged out" })
        .code(401)
        .takeover();
    }

     request.pre.user = decoded;
    return h.continue;
  } catch (err) {
    return h
      .response({ error: "Token invalid or expired" })
      .code(401)
      .takeover();
  }
};

module.exports = requireAuth;
