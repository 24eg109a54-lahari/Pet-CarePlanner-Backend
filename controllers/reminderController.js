import { Reminder } from "../models/Reminder.js";

export const reminderController = {
  async getReminders(req, res) {
    const reminders = await Reminder.findAll();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: reminders }));
  },

  async createReminder(req, res) {
    const body = req.body || {};
    if (!body.title) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Reminder title is required" }));
      return;
    }
    const record = await Reminder.create(body);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: record }));
  },

  async deleteReminder(req, res, id) {
    const deleted = await Reminder.delete(id);
    if (!deleted) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Reminder not found" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Reminder deleted successfully" }));
  },
};
