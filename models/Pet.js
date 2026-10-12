import { readDb, writeDb, isUsingMySql, mysqlReadAll, mysqlInsert, mysqlDeleteById } from "../config/db.js";

export const Pet = {
  async findAll() {
    if (isUsingMySql()) return mysqlReadAll("pets");
    const db = await readDb();
    return db.pets || [];
  },

  async findById(id) {
    if (isUsingMySql()) {
      const rows = await mysqlReadAll("pets");
      return rows.find((p) => String(p.id) === String(id)) || null;
    }
    const db = await readDb();
    return (db.pets || []).find((p) => String(p.id) === String(id)) || null;
  },

  async create(data) {
    const newPet = {
      id: data.id || "pet_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      userId: data.userId || "",
      name: data.name || "",
      type: data.type || "Other",
      breed: data.breed || "",
      age: data.age || "",
      gender: data.gender || "",
      color: data.color || "",
      weight: data.weight || "",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
    };
    if (isUsingMySql()) {
      await mysqlInsert("pets", newPet);
    } else {
      const db = await readDb();
      db.pets = db.pets || [];
      db.pets.push(newPet);
      await writeDb(db);
    }
    return newPet;
  },

  async delete(id) {
    if (isUsingMySql()) return mysqlDeleteById("pets", id);
    const db = await readDb();
    const initialLen = (db.pets || []).length;
    db.pets = (db.pets || []).filter((p) => String(p.id) !== String(id));
    await writeDb(db);
    return db.pets.length < initialLen;
  },
};
