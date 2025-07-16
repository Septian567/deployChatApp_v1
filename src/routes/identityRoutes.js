const controller = require("../controllers/identityController");
const requireAuth = require("../middleware/authMiddleware");

module.exports = [
  {
    method: "GET",
    path: "/identity/{id}",
    handler: controller.getUsernameById,
    options: { pre: [{ method: requireAuth }] },
  },
];
