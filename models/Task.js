import { readDb, writeDb, isUsingMySql, mysqlReadAll, mysqlInsert, mysqlDeleteById } from "../config/db.js";

export const Task = {
  async findAll() {
    if (isUsingMySql()) return mysqlReadAll("tasks");
    const db = await readDb();
    return db.tasks || [];
  },

  async create(data) {
    const newTask = {
      id: data.id || "task_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      userId: data.userId || "",
      petId: data.petId || "",
      petName: data.petName || "",
      task: data.task || "",
      type: data.type || "Daily Care",
      date: data.date || new Date().toISOString().split("T")[0],
      time: data.time || "",
      status: data.status || "Pending",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
    };
    if (isUsingMySql()) {
      await mysqlInsert("tasks", newTask);
    } else {
      const db = await readDb();
      db.tasks = db.tasks || [];
      db.tasks.push(newTask);
      await writeDb(db);
    }
    return newTask;
  },

  async delete(id) {
    if (isUsingMySql()) return mysqlDeleteById("tasks", id);
    const db = await readDb();
    const initialLen = (db.tasks || []).length;
    db.tasks = (db.tasks || []).filter((t) => String(t.id) !== String(id));
    await writeDb(db);
    return db.tasks.length < initialLen;
  },
};
