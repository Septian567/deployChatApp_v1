const WebSocket = require("ws");
const { verifyToken } = require("./jwt");
const chatService = require("../services/chatService");

const connectedClients = new Map(); // userId -> ws

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", async (ws, req) => {
    try {
      const token = new URLSearchParams(req.url.split("?")[1]).get("token");
      const payload = verifyToken(token);
      const userId = payload.userId;

      connectedClients.set(userId, ws);
      console.log(`🟢 User ${userId} connected via WebSocket`);

      ws.on("message", async (data) => {
        const { type, payload } = JSON.parse(data);

        if (type === "send_message") {
          const { recipientId, content } = payload;
          const chat = await chatService.createOrGetChat(userId, recipientId);
          const message = await chatService.saveMessage(
            chat.id,
            userId,
            content
          );

          const messagePayload = {
            type: "new_message",
            payload: message,
          };

          const recipientWs = connectedClients.get(recipientId);
          if (recipientWs) {
            recipientWs.send(JSON.stringify(messagePayload));
          }

          ws.send(JSON.stringify({ type: "message_sent", payload: message }));
        }

        if (type === "edit_message") {
          const { messageId, content } = payload;
          const updated = await chatService.editMessage(
            userId,
            messageId,
            content
          );

          if (updated) {
            broadcastToChatParticipants(updated.chat_id, {
              type: "message_edited",
              payload: updated,
            });
          }
        }

        if (type === "delete_message") {
          const { messageId } = payload;
          const deleted = await chatService.deleteMessage(userId, messageId);

          if (deleted) {
            broadcastToChatParticipants(deleted.chat_id, {
              type: "message_deleted",
              payload: { messageId },
            });
          }
        }
      });

      ws.on("close", () => {
        connectedClients.delete(userId);
        console.log(`🔴 User ${userId} disconnected`);
      });
    } catch (err) {
      console.error("WebSocket error:", err.message);
      ws.close();
    }
  });

  async function broadcastToChatParticipants(chatId, data) {
    const userIds = await chatService.getChatParticipants(chatId);
    userIds.forEach((uid) => {
      const ws = connectedClients.get(uid);
      if (ws) {
        ws.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = { initWebSocket };
