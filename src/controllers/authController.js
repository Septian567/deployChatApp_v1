const authService = require("../services/authService");

// --- Register ---
const register = async (request, h) => {
  try {
    const result = await authService.registerUser(request.payload);
    return h.response(result).code(201);
  } catch (err) {
    return h.response({ error: err.message }).code(400);
  }
};

// --- Login ---
const login = async (request, h) => {
  try {
    const result = await authService.loginUser(request.payload);
    return h.response(result).code(200);
  } catch (err) {
    return h.response({ error: err.message }).code(400);
  }
};

// --- Logout ---
const logout = async (request, h) => {
  try {
    const token = request.headers.authorization?.replace("Bearer ", "");
    if (!token) throw new Error("Token is required");

    const result = await authService.logout(token);
    return h.response(result).code(200);
  } catch (err) {
    return h.response({ error: err.message }).code(400);
  }
};

module.exports = {
  register,
  login,
  logout,
};
