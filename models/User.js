import { readDb, writeDb, isUsingMySql, mysqlReadAll, mysqlInsert, mysqlDeleteById } from "../config/db.js";
import crypto from "crypto";

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

export const User = {
  hashPassword,

  verifyPassword(user, plainPassword) {
    if (!user || !user.password) return false;
    const hashed = hashPassword(plainPassword);
    return user.password === hashed || user.password === plainPassword;
  },

  async findByEmail(email) {
    if (isUsingMySql()) {
      const rows = await mysqlReadAll("users");
      return rows.find((u) => String(u.email || "").toLowerCase() === String(email || "").toLowerCase()) || null;
    }
    const db = await readDb();
    return (db.users || []).find(
      (u) => String(u.email || "").toLowerCase() === String(email || "").toLowerCase()
    ) || null;
  },

  async findById(id) {
    if (isUsingMySql()) {
      const rows = await mysqlReadAll("users");
      return rows.find((u) => String(u.id) === String(id)) || null;
    }
    const db = await readDb();
    return (db.users || []).find((u) => String(u.id) === String(id)) || null;
  },

  async create(data) {
    const newUser = {
      id: data.id || "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      name: data.name || "",
      email: data.email || "",
      password: hashPassword(data.password || ""),
      createdAt: new Date().toISOString(),
    };

    if (isUsingMySql()) {
      await mysqlInsert("users", newUser);
    } else {
      const db = await readDb();
      db.users = db.users || [];
      db.users.push(newUser);
      await writeDb(db);
    }

    return { id: newUser.id, name: newUser.name, email: newUser.email };
  },
};
