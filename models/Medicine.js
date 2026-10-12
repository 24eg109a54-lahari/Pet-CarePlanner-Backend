import { readDb, writeDb, isUsingMySql, mysqlReadAll, mysqlInsert, mysqlDeleteById } from "../config/db.js";

export const Medicine = {
  async findAll() {
    if (isUsingMySql()) return mysqlReadAll("medicines");
    const db = await readDb();
    return db.medicines || [];
  },

  async create(data) {
    const newMedicine = {
      id: data.id || "med_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      userId: data.userId || "",
      petId: data.petId || "",
      petName: data.petName || "",
      name: data.name || data.medicineName || "",
      dosage: data.dosage || "",
      frequency: data.frequency || "",
      startDate: data.startDate || "",
      endDate: data.endDate || "",
      instructions: data.instructions || "",
      prescribedBy: data.prescribedBy || "",
      createdAt: new Date().toISOString(),
    };
    if (isUsingMySql()) {
      await mysqlInsert("medicines", newMedicine);
    } else {
      const db = await readDb();
      db.medicines = db.medicines || [];
      db.medicines.push(newMedicine);
      await writeDb(db);
    }
    return newMedicine;
  },

  async delete(id) {
    if (isUsingMySql()) return mysqlDeleteById("medicines", id);
    const db = await readDb();
    const initialLen = (db.medicines || []).length;
    db.medicines = (db.medicines || []).filter((m) => String(m.id) !== String(id));
    await writeDb(db);
    return db.medicines.length < initialLen;
  },
};
