import { readDb, writeDb, isUsingMySql, mysqlReadAll, mysqlInsert, mysqlDeleteById } from "../config/db.js";

export const Reminder = {
  async findAll() {
    if (isUsingMySql()) return mysqlReadAll("reminders");
    const db = await readDb();
    return db.reminders || [];
  },

  async create(data) {
    const newReminder = {
      id: data.id || "rem_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      userId: data.userId || "",
      petId: data.petId || "",
      petName: data.petName || "",
      title: data.title || "",
      category: data.category || "General",
      date: data.date || "",
      time: data.time || "",
      repeat: data.repeat || "None",
      notes: data.notes || "",
      completed: data.completed ? 1 : 0,
      createdAt: new Date().toISOString(),
    };
    if (isUsingMySql()) {
      await mysqlInsert("reminders", newReminder);
      newReminder.completed = Boolean(newReminder.completed);
    } else {
      newReminder.completed = !!data.completed;
      const db = await readDb();
      db.reminders = db.reminders || [];
      db.reminders.push(newReminder);
      await writeDb(db);
    }
    return newReminder;
  },

  async delete(id) {
    if (isUsingMySql()) return mysqlDeleteById("reminders", id);
    const db = await readDb();
    const initialLen = (db.reminders || []).length;
    db.reminders = (db.reminders || []).filter((r) => String(r.id) !== String(id));
    await writeDb(db);
    return db.reminders.length < initialLen;
  },
};
