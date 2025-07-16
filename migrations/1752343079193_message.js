exports.up = (pgm) => {
  pgm.createTable("messages", {
    message_id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    from_user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"(id)',
      onDelete: "cascade",
    },
    to_user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"(id)',
      onDelete: "cascade",
    },
    message_text: {
      type: "text",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },
    read_at: {
      type: "timestamp",
      default: null,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("messages");
};
