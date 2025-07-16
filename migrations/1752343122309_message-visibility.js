exports.up = (pgm) => {
  pgm.createTable("message_user_visibility", {
    message_id: {
      type: "uuid",
      notNull: true,
      references: '"messages"(message_id)',
      onDelete: "cascade",
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"(id)',
      onDelete: "cascade",
    },
    is_visible: {
      type: "boolean",
      notNull: true,
      default: true,
    },
    hidden_at: { type: "timestamp", default: null },
  });

  pgm.addConstraint(
    "message_user_visibility",
    "unique_message_user",
    "UNIQUE(message_id, user_id)"
  );
};
