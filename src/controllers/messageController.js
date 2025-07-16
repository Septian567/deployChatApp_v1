const { v4: uuidv4 } = require("uuid");
const path = require("path");

const { uploadToS3 } = require("../utils/uploadS3");
const messageService = require("../services/messageService");
const userService = require("../services/userService");
const contactService = require("../services/contactService");

const reservedKeys = ["messageText", "toUserId"];

const sendMessage = async (request, h) => {
  const toUserId = request.payload.toUserId?.toString();
  const messageText = request.payload.messageText?.toString() || "";
  const fromUserId = request.pre.user.userId;

  const files = [];

  try {
    for (const key in request.payload) {
      if (reservedKeys.includes(key)) continue;

      const item = request.payload[key];
      if (item && item._data && item.hapi && item.hapi.filename) {
        const ext = path.extname(item.hapi.filename);
        const filename = `${uuidv4()}${ext}`;

        const buffer = await streamToBuffer(item);

        const mediaUrl = await uploadToS3({
          buffer,
          filename,
          contentType: item.hapi.headers["content-type"],
          folder: "messages",
        });

        files.push({
          mediaType: detectMediaType(ext),
          mediaUrl,
          mediaName: item.hapi.filename,
          mediaSize: buffer.length,
        });
      }
    }

    const fromUser = await userService.getUserById(fromUserId);
    const toUser = await userService.getUserById(toUserId);
    if (!fromUser || !toUser) {
      return h.response({ error: "User tidak ditemukan" }).code(404);
    }

    const contact = await contactService.getContactByUserIdAndContactId(
      fromUserId,
      toUserId
    );
    if (!contact) {
      return h.response({ error: "Penerima bukan kontak Anda" }).code(403);
    }

    const message = await messageService.sendMessage({
      fromUserId,
      toUserId,
      messageText,
      attachments: files,
    });

    request.server.app.io.to(toUser.username).emit("newMessage", message);

    return h.response(message).code(201);
  } catch (err) {
    console.error("sendMessage error:", err);
    return h.response({ error: "Gagal mengirim pesan" }).code(500);
  }
};

const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

const detectMediaType = (ext) => {
  const extLower = ext.toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(extLower))
    return "image";
  if ([".mp4", ".mov", ".avi", ".mkv"].includes(extLower)) return "video";
  if ([".mp3", ".wav", ".ogg"].includes(extLower)) return "audio";
  return "file";
};

const getMessagesBetweenUsers = async (request, h) => {
  const { userId, contactId } = request.params;

  const io = request.server.app.io;

  try {
    const viewer = await userService.getUserById(userId);
    if (!viewer) {
      return h.response({ error: "Pengguna tidak ditemukan" }).code(404);
    }

    const contact = await contactService.getContactById(userId, contactId);
    if (!contact) {
      return h.response({ error: "Kontak tidak ditemukan" }).code(404);
    }

    const messages = await messageService.getMessagesBetween(userId, contactId);

    io.to(userId).emit("messagesFetched", {
      contactId,
      messages,
    });

    return h.response(messages).code(200);
  } catch (error) {
    return h.response({ error: "Gagal mengambil pesan" }).code(500);
  }
};

const updateMessage = async (request, h) => {
  const { message_id } = request.params;
  const { messageText } = request.payload;
  const userId = request.pre.user.userId;

  const io = request.server.app.io;

  try {
    const message = await messageService.getMessageById(message_id);

    if (!message) {
      return h.response({ error: "Pesan tidak ditemukan" }).code(404);
    }

    if (message.from_user_id !== userId) {
      return h
        .response({ error: "Tidak diizinkan mengedit pesan ini" })
        .code(403);
    }

    const updated = await messageService.updateMessageText(
      message_id,
      messageText
    );

    // Emit event ke pengirim & penerima
    const roomSender = message.from_user_id;
    const roomReceiver = message.to_user_id;

    io.to(roomSender).emit("messageUpdated", updated);
    io.to(roomReceiver).emit("messageUpdated", updated);

    return h.response(updated).code(200);
  } catch (error) {
    return h.response({ error: "Gagal mengedit pesan" }).code(500);
  }
};

const deleteMessage = async (request, h) => {
  const { message_id } = request.params;
  const userId = request.pre.user.userId;
  const io = request.server.app.io;

  try {
    const message = await messageService.getMessageById(message_id);

    if (!message) {
      return h.response({ error: "Pesan tidak ditemukan" }).code(404);
    }

    if (message.from_user_id !== userId) {
      return h
        .response({ error: "Tidak diizinkan menghapus pesan ini" })
        .code(403);
    }

    const deleted = await messageService.deleteMessage(message_id);
    const toUser = message.to_user_id;

    io.to(userId).emit("messageDeleted", { message_id });
    io.to(toUser).emit("messagDeleted", { message_id });

    return h
      .response({ message: "Pesan berhasil dihapus", data: deleted })
      .code(200);
  } catch (error) {
    return h.response({ error: "Gagal menghapus pesan" }).code(500);
  }
};

const deleteConversation = async (request, h) => {
  const { fromUserId, toContactId } = request.params;

  try {
    const fromUser = await userService.getUserById(fromUserId);
    if (!fromUser) {
      return h.response({ error: "User tidak ditemukan" }).code(404);
    }

    const toContact = await contactService.getContactById(
      fromUserId,
      toContactId
    );

    if (!toContact) {
      return h.response({ error: "Kontak tidak ditemukan" }).code(404);
    }

    const hiddenMessages = await messageService.deleteConversationBetween(
      fromUserId,
      toContactId
    );

    return h
      .response({
        message: "Percakapan berhasil disembunyikan",
        hiddenCount: hiddenMessages.length,
      })
      .code(200);
  } catch (error) {
    return h.response({ error: "Gagal menyembunyikan percakapan" }).code(500);
  }
};

const deleteMessageForUser = async (request, h) => {
  const { user_id, message_id } = request.params;

  try {
    // (Optional) Validasi apakah user ada
    const user = await userService.getUserById(user_id);
    if (!user) {
      return h.response({ error: "User tidak ditemukan" }).code(404);
    }

    const result = await messageService.deleteMessageForUser(
      user_id,
      message_id
    );

    if (!result) {
      return h
        .response({ error: "Pesan tidak ditemukan atau sudah disembunyikan" })
        .code(404);
    }

    return h
      .response({
        message: "Pesan berhasil disembunyikan dari user",
        data: result,
      })
      .code(200);
  } catch (error) {
    return h.response({ error: "Gagal menyembunyikan pesan" }).code(500);
  }
};

module.exports = {
  sendMessage,
  getMessagesBetweenUsers,
  updateMessage,
  deleteMessage,
  deleteConversation,
  deleteMessageForUser,
};
