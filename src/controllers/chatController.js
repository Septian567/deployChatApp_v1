const chatService = require("../services/chatService");

const findOrCreateChat = async (request, h) => {
  const { userId } = request.auth;
  const { otherUserId } = request.payload;

  if (userId === otherUserId) {
    return h.response({ error: "Cannot chat with yourself" }).code(400);
  }

  const chat = await chatService.findOrCreateChat(userId, otherUserId);
  return h.response(chat).code(200);
};

const getChats = async (request, h) => {
  const { userId } = request.auth;
  const chats = await chatService.getUserChats(userId);
  return h.response(chats).code(200);
};

const postMessage = async (request, h) => {
  const { userId } = request.auth;
  const { chatId } = request.params;
  const { content } = request.payload;

  const message = await chatService.sendMessage({
    chatId,
    senderId: userId,
    content,
  });
  return h.response(message).code(201);
};

const getMessages = async (request, h) => {
  const { chatId } = request.params;
  const messages = await chatService.getMessages(chatId);
  return h.response(messages).code(200);
};

const checkChat = async (request, h) => {
  const { userId } = request.auth;
  const { otherUserId } = request.params;

  if (userId === otherUserId) {
    return h.response({ error: "Cannot check chat with yourself" }).code(400);
  }

  const chat = await chatService.checkChatExists(userId, otherUserId);
  return h.response({ chat }).code(200);
};

module.exports = {
  findOrCreateChat,
  getChats,
  postMessage,
  getMessages,
  checkChat
};
