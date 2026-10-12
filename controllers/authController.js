import { User } from "../models/User.js";

export const authController = {
  async register(req, res) {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Name, email, and password are required" }));
      return;
    }
    const existing = await User.findByEmail(email);
    if (existing) {
      res.writeHead(409, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "User already exists with this email" }));
      return;
    }
    const user = await User.create({ name, email, password });
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Registration successful", user }));
  },

  async login(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Email and password are required" }));
      return;
    }
    const user = await User.findByEmail(email);
    if (!user || !User.verifyPassword(user, password)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Invalid email or password" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        message: "Login successful",
        user: { id: user.id, name: user.name, email: user.email },
      })
    );
  },
};

