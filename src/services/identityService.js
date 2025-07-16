const userService = require("./userService");
const contactService = require("./contactService");

const getUsernameById = async (id) => {
  const user = await userService.getUserById(id);
  if (user) return user.username;

  const contact = await contactService.getContactById(id);
  if (contact) return contact.username;

  return null;
};

module.exports = {
  getUsernameById,
};
