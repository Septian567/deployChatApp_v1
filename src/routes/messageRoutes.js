const messageController = require("../controllers/messageController");
const requireAuth = require("../middleware/authMiddleware");

const messageRoutes = [
  {
    method: "POST",
    path: "/messages",
    handler: messageController.sendMessage,
    options: {
      pre: [{ method: requireAuth }],
      payload: {
        output: "stream", // penting untuk handle file
        parse: true,
        allow: "multipart/form-data", // dukung form upload
        multipart: true,
        maxBytes: 20 * 1024 * 1024, // batas file (10MB misalnya)
      },
    },
  },
  {
    method: "GET",
    path: "/messages/{userId}/with/{contactId}",
    handler: messageController.getMessagesBetweenUsers,
    options: { pre: [{ method: requireAuth }] },
  },
  {
    method: "PUT",
    path: "/messages/{message_id}",
    handler: messageController.updateMessage,
    options: { pre: [{ method: requireAuth }] },
  },
  {
    method: "DELETE",
    path: "/messages/{message_id}",
    handler: messageController.deleteMessage,
    options: { pre: [{ method: requireAuth }] },
  },
  {
    method: "DELETE",
    path: "/users/{user_id}/messages/{message_id}",
    handler: messageController.deleteMessageForUser,
    options: { pre: [{ method: requireAuth }] },
  },
  {
    method: "DELETE",
    path: "/messages/conversation/{fromUserId}/{toContactId}",
    handler: messageController.deleteConversation,
    options: { pre: [{ method: requireAuth }] },
  },
];

module.exports = messageRoutes;
