const controller = require("../controllers/contactController");
const requireAuth = require("../middleware/authMiddleware");

module.exports = [
  {
    method: "GET",
    path: "/me/contacts",
    handler: controller.getContacts,
    options: { pre: [{ method: requireAuth }] },
  },
  {
    method: "GET",
    path: "/me/contacts/{contactId}",
    handler: controller.getContactById,
    options: { pre: [{ method: requireAuth }] },
  },
  {
    method: "POST",
    path: "/contacts",
    handler: controller.createContact,
    options: { pre: [{ method: requireAuth }] },
  },
  {
    method: "PUT",
    path: "/me/contacts/{contactId}",
    handler: controller.updateContact,
    options: { pre: [{ method: requireAuth }] },
  },
  {
    method: "DELETE",
    path: "/me/contacts/{contactId}",
    handler: controller.deleteContact,
    options: { pre: [{ method: requireAuth }] },
  },
];
