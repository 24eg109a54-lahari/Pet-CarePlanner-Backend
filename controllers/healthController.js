import { HealthRecord } from "../models/HealthRecord.js";

export const healthController = {
  async getHealthRecords(req, res) {
    const list = await HealthRecord.findAll();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: list }));
  },

  async createHealthRecord(req, res) {
    const body = req.body || {};
    const record = await HealthRecord.create(body);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: record }));
  },

  async deleteHealthRecord(req, res, id) {
    const deleted = await HealthRecord.delete(id);
    if (!deleted) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Health record not found" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Health record deleted successfully" }));
  },
};
