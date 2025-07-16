"use strict";

require("dotenv").config();
const Hapi = require("@hapi/hapi");
const http = require("http");
const { Server: SocketIO } = require("socket.io");

// Import routes
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const identityRoutes = require("./routes/identityRoutes");
const messageRoutes = require("./routes/messageRoutes");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"], // Ubah ini di production
      },
    },
  });

  // --- REMOVE THIS BLOCK ---
  // Tidak diperlukan lagi karena semua file diunggah ke S3
  // server.route({
  //   method: "GET",
  //   path: "/uploads/{param*}",
  //   handler: {
  //     directory: {
  //       path: "uploads",
  //       listing: false,
  //       index: false,
  //     },
  //   },
  // });

  // Register all routes
  server.route([
    ...authRoutes,
    ...userRoutes,
    ...contactRoutes,
    ...identityRoutes,
    ...messageRoutes,
  ]);

  // Create HTTP server for Socket.IO
  const listener = http.createServer(server.listener);
  const io = new SocketIO(listener, {
    cors: {
      origin: "*", // Ubah ini di production
      methods: ["GET", "POST"],
    },
  });

  // Store io instance in Hapi server
  server.app.io = io;

  io.on("connection", (socket) => {
    socket.on("join", (username) => {
      socket.join(username);
    });

    socket.on("pingTest", () => {
      socket.emit("pongTest");
    });

    socket.on("disconnect", () => {
      // Optional: log disconnect or clean up
    });
  });

  // Start Hapi server
  await server.start();
  listener.listen(process.env.PORT || 3000);

  console.log(`Server running at: ${server.info.uri}`);
};

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

init();
