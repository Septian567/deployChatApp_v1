exports.up = (pgm) => {
  pgm.addColumn("messages", {
    updated_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("messages", "updated_at");
};
