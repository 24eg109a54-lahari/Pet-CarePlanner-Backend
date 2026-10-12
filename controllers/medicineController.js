import { Medicine } from "../models/Medicine.js";

export const medicineController = {
  async getMedicines(req, res) {
    const list = await Medicine.findAll();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: list }));
  },

  async createMedicine(req, res) {
    const body = req.body || {};
    const name = body.name || body.medicineName;
    if (!name) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Medicine name is required" }));
      return;
    }
    const record = await Medicine.create(body);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: record }));
  },

  async deleteMedicine(req, res, id) {
    const deleted = await Medicine.delete(id);
    if (!deleted) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Medicine not found" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Medicine deleted successfully" }));
  },
};
