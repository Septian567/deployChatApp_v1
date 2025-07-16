const controller = require("../controllers/authController");

module.exports = [
  {
    method: "POST",
    path: "/auth/register",
    handler: controller.register,
  },
  {
    method: "POST",
    path: "/auth/login",
    handler: controller.login,
  },
  {
    method: "POST",
    path: "/auth/logout",
    handler: controller.logout,
  },
];
