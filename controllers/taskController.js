import { Task } from "../models/Task.js";

export const taskController = {
  async getTasks(req, res) {
    const tasks = await Task.findAll();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: tasks }));
  },

  async createTask(req, res) {
    const body = req.body || {};
    if (!body.task) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Task description is required" }));
      return;
    }
    const newTask = await Task.create(body);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: newTask }));
  },

  async deleteTask(req, res, id) {
    const deleted = await Task.delete(id);
    if (!deleted) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Task not found" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Task deleted successfully" }));
  },
};
