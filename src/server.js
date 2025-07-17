"use strict";

require("dotenv").config();
const Hapi = require("@hapi/hapi");
const { Server: SocketIO } = require("socket.io");

// Import routes
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const identityRoutes = require("./routes/identityRoutes");
const messageRoutes = require("./routes/messageRoutes");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3002,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"], // Ubah di production
      },
    },
  });

  // Register all routes
  server.route([
    ...authRoutes,
    ...userRoutes,
    ...contactRoutes,
    ...identityRoutes,
    ...messageRoutes,
  ]);

  // Socket.IO dengan Hapi
  const io = new SocketIO(server.listener, {
    cors: {
      origin: "*", // Ubah di production
      methods: ["GET", "POST"],
    },
  });

  server.app.io = io;

  io.on("connection", (socket) => {
    socket.on("join", (username) => {
      socket.join(username);
    });

    socket.on("pingTest", () => {
      socket.emit("pongTest");
    });

    socket.on("disconnect", () => {
      // Optional: cleanup
    });
  });

  await server.start(); // Ini cukup, jangan pakai .listen() lagi
  console.log(`✅ Server running at: ${server.info.uri}`);
};

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

init();
