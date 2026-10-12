import { readDb, writeDb, isUsingMySql, mysqlReadAll, mysqlInsert, mysqlDeleteById } from "../config/db.js";

export const Vaccination = {
  async findAll() {
    if (isUsingMySql()) return mysqlReadAll("vaccinations");
    const db = await readDb();
    return db.vaccinations || [];
  },

  async create(data) {
    const newVaccination = {
      id: data.id || "vac_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      userId: data.userId || "",
      petId: data.petId || "",
      petName: data.petName || "",
      vaccineName: data.vaccineName || data.vaccine || "",
      dateGiven: data.dateGiven || data.date || "",
      dueDate: data.dueDate || data.nextDue || "",
      vetName: data.vetName || data.vet || "",
      clinicName: data.clinicName || data.clinic || "",
      status: data.status || "Completed",
      notes: data.notes || "",
      createdAt: new Date().toISOString(),
    };
    if (isUsingMySql()) {
      await mysqlInsert("vaccinations", newVaccination);
    } else {
      const db = await readDb();
      db.vaccinations = db.vaccinations || [];
      db.vaccinations.push(newVaccination);
      await writeDb(db);
    }
    return newVaccination;
  },

  async delete(id) {
    if (isUsingMySql()) return mysqlDeleteById("vaccinations", id);
    const db = await readDb();
    const initialLen = (db.vaccinations || []).length;
    db.vaccinations = (db.vaccinations || []).filter((v) => String(v.id) !== String(id));
    await writeDb(db);
    return db.vaccinations.length < initialLen;
  },
};
