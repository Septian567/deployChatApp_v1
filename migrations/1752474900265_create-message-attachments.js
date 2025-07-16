exports.up = (pgm) => {
  pgm.createTable("message_attachments", {
    attachment_id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    message_id: {
      type: "uuid",
      notNull: true,
      references: '"messages"(message_id)',
      onDelete: "cascade",
    },
    media_type: {
      type: "text",
      notNull: true,
    },
    media_url: {
      type: "text",
      default: null,
    },
    media_name: {
      type: "text",
      default: null,
    },
    media_size: {
      type: "integer",
      default: null,
    },
    uploaded_at: {
      type: "timestamp",
      defauilt: pgm.func("current_timestamp"),
    },
    deleted_at: {
      type: "timestamp",
      default: null,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("message_attachments");
};
