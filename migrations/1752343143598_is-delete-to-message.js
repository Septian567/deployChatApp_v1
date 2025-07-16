exports.up = (pgm) => {
  pgm.addColumns("messages", {
    is_deleted: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    deleted_at: {
      type: "timestamp",
      default: null,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("messages", ["is_deleted", "deleted_at"]);
};
