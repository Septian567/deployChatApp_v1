const userService = require("../services/userService");
const { uploadToS3 } = require("../utils/uploadS3");

// --- Update profile ---
const updateProfile = async (request, h) => {
  try {
    const { userId } = request.pre.user;
    const { username, email, avatar } = request.payload;

    let avatarUrl = null;

    if (avatar) {
      const filename = `${Date.now()}_${avatar.hapi.filename}`;
      const contentType = avatar.hapi.headers["content-type"];

      // Convert stream to buffer
      const buffer = await new Promise((resolve, reject) => {
        const chunks = [];
        avatar.on("data", (chunk) => chunks.push(chunk));
        avatar.on("end", () => resolve(Buffer.concat(chunks)));
        avatar.on("error", reject);
      });

      avatarUrl = await uploadToS3({
        buffer,
        filename,
        contentType,
        folder: "avatars",
      });
    }

    const updatedUser = await userService.updateUser(userId, {
      username,
      email,
      avatarUrl,
    });

    return h.response(updatedUser).code(200);
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === "23505" && error.detail?.includes("email")) {
      return h
        .response({ error: "Email sudah digunakan oleh pengguna lain." })
        .code(400);
    }

    return h.response({ error: "Internal Server Error" }).code(500);
  }
};

const getProfile = async (request, h) => {
  const userId = request.pre.user.userId;
  const user = await userService.getUserById(userId);
  return h.response(user).code(200);
};

// --- Get all users ---
const getAllUsers = async (request, h) => {
  const users = await userService.getAllUsers();
  return h.response(users).code(200);
};

// --- Search users by query ---
const searchUsers = async (request, h) => {
  const query = request.query.query;

  if (!query) {
    return h.response({ error: "Query parameter is required" }).code(400);
  }

  try {
    const results = await userService.searchUsers(query);
    return h.response(results).code(200);
  } catch (err) {
    return h.response({ error: "Internal server error" }).code(500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  searchUsers,
};
