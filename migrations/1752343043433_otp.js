exports.up = (pgm) => {
  pgm.createTable("otp_requests", {
    id: "id",
    username: { type: "varchar(100)", notNull: true },
    phone_number: { type: "varchar(20)", notNull: true },
    otp_code: { type: "varchar(6)", notNull: false },
    expires_at: { type: "timestamp", notNull: true },
    verified: { type: "boolean", default: false },
    created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("otp_requests");
};
