const contactService = require("../services/contactService");
const userService = require("../services/userService");

const getContacts = async (request, h) => {
  const { userId } = request.pre.user;

  const user = await userService.getUserById(userId);
  if (!user) {
    return h.response({ message: "User tidak ditemukan" }).code(404);
  }

  const contacts = await contactService.getAllContacts(userId);
  return h.response(contacts).code(200);
};

const getContactById = async (request, h) => {
  const { contactId } = request.params;
  const { userId } = request.pre.user;

  const user = await userService.getUserById(userId);
  if (!user) {
    return h.response({ message: "User tidak ditemukan" }).code(404);
  }

  const contact = await contactService.getContactById(user.id, contactId);
  if (!contact) {
    return h.response({ message: "Kontak tidak ditemukan" }).code(404);
  }

  return h.response(contact).code(200);
};

const createContact = async (request, h) => {
  const { contactId, alias } = request.payload;
  const { userId } = request.pre.user;

  const user = await userService.getUserById(userId);
  const contactUser = await userService.getUserById(contactId);

  if (!user || !contactUser) {
    return h
      .response({ message: "User atau kontak tidak ditemukan" })
      .code(404);
  }

  if (user.id === contactUser.id) {
    return h
      .response({
        message: "Tidak bisa menambahkan diri sendiri sebagai kontak",
      })
      .code(400);
  }

  // Cek apakah kontak sudah ada sebelumnya
  const existing = await contactService.getContactByUserIdAndContactId(
    userId,
    contactId
  );
  if (existing) {
    return h.response({ message: "Kontak sudah ada" }).code(409); // Conflict
  }

  const contact = await contactService.createContact({
    userId: user.id,
    contactId: contactUser.id,
    alias,
  });

  return h.response(contact).code(201);
};

const updateContact = async (request, h) => {
  const { contactId } = request.params;
  const { alias } = request.payload;
  const { userId } = request.pre.user;

  const user = await userService.getUserById(userId);
  if (!user) {
    return h.response({ message: "User tidak ditemukan" }).code(404);
  }

  const existing = await contactService.getContactByUserIdAndContactId(
    userId,
    contactId
  );
  if (!existing) {
    return h.response({ message: "Kontak tidak ditemukan" }).code(404);
  }

  const updated = await contactService.updateContact({
    userId: user.id,
    contactId,
    alias,
  });

  return h.response(updated).code(200);
};

const deleteContact = async (request, h) => {
  const { contactId } = request.params;
  const { userId } = request.pre.user;

  const user = await userService.getUserById(userId);
  if (!user) {
    return h.response({ message: "User tidak ditemukan" }).code(404);
  }

  try {
    const { success, deletedData } = await contactService.deleteContact(
      user.id,
      contactId
    );

    if (!success) {
      return h
        .response({
          message: "Kontak tidak ditemukan",
        })
        .code(404);
    }

    return h
      .response({
        status: "success",
        message: "Kontak berhasil dihapus",
        deletedContact: deletedData,
      })
      .code(200);
  } catch (err) {
    return h
      .response({
        message: "Gagal menghapus kontak",
        error: err.message,
      })
      .code(500);
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
