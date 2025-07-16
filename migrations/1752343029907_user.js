exports.up = (pgm) => {
  pgm.createExtension("uuid-ossp", { ifNotExists: true });

 pgm.createTable("users", {
   id: {
     type: "uuid",
     primaryKey: true,
     default: pgm.func("uuid_generate_v4()"),
   },
   email: { type: "varchar(255)", notNull: true, unique: true },
   password_hash: { type: "text", notNull: true },
   username: { type: "varchar(100)" },
   avatar_url: { type: "text", default: "" },
   created_at: { type: "timestamp", default: pgm.func("current_timestamp") },
   updated_at: { type: "timestamp", default: pgm.func("current_timestamp") },
 });

};

exports.down = (pgm) => {
  pgm.dropTable("users");
};
