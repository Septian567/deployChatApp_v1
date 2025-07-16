exports.up = (pgm) => {
  pgm.createTable("contacts", {
    user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"(id)',
      onDelete: "cascade",
    },
    contact_id: {
      type: "uuid",
      notNull: true,
      references: '"users"(id)',
      onDelete: "cascade",
    },
    alias: { type: "varchar(100)" },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
  });

  pgm.addConstraint(
    "contacts",
    "unique_user_contact",
    "UNIQUE(user_id, contact_id)"
  );
};
