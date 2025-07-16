/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable("token_blacklist", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    token: {
      type: "text",
      notNull: true,
    },
    blacklisted_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("token_blacklist", "token");
};

exports.down = (pgm) => {
  pgm.dropTable("token_blacklist");
};
