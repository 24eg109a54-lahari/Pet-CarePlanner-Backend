import { Vaccination } from "../models/Vaccination.js";

export const vaccinationController = {
  async getVaccinations(req, res) {
    const list = await Vaccination.findAll();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: list }));
  },

  async createVaccination(req, res) {
    const body = req.body || {};
    const name = body.vaccineName || body.vaccine;
    if (!name) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Vaccine name is required" }));
      return;
    }
    const record = await Vaccination.create(body);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: record }));
  },

  async deleteVaccination(req, res, id) {
    const deleted = await Vaccination.delete(id);
    if (!deleted) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Vaccination record not found" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Vaccination deleted successfully" }));
  },
};
