const identityService = require("../services/identityService");

const getUsernameById = async (request, h) => {
  try {
    const { id } = request.params; // ✅ ambil ID dari route param
    const username = await identityService.getUsernameById(id); // ✅ kirim id, bukan request

    if (!username) {
      return h
        .response({ message: "User atau kontak tidak ditemukan" })
        .code(404);
    }

    return h.response({ id, username }).code(200);
  } catch (error) {
    console.error("Error in getUsernameById:", error);
    return h
      .response({
        message: "Terjadi kesalahan di server",
        detail: error.message,
      })
      .code(500);
  }
};

module.exports = {
  getUsernameById,
};
