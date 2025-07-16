const controller = require("../controllers/userController");
const requireAuth = require("../middleware/authMiddleware");

module.exports = [
  {
    method: "GET",
    path: "/me",
    handler: controller.getProfile,
    options: { pre: [{ method: requireAuth }] },
  },
  {
    method: "GET",
    path: "/users",
    handler: controller.getAllUsers,
    options: { pre: [{ method: requireAuth }] },
  },
  {
    method: "PUT",
    path: "/me",
    handler: controller.updateProfile,
    options: {
      pre: [{ method: requireAuth }],
      payload: {
        output: "stream",
        parse: true,
        multipart: true, // <--- penting
        maxBytes: 5 * 1024 * 1024, // batas 5MB
        allow: "multipart/form-data",
      },
    },
  },
  {
    method: "GET",
    path: "/users/search",
    handler: controller.searchUsers,
    options: {
      pre: [{ method: requireAuth }],
    },
  },
];
