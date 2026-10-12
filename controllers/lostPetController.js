import { LostPet } from "../models/LostPet.js";

export const lostPetController = {
  async getLostPets(req, res) {
    const list = await LostPet.findAll();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: list }));
  },

  async createLostPet(req, res) {
    const body = req.body || {};
    const name = body.petName || body.name;
    if (!name) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Pet name is required" }));
      return;
    }
    const record = await LostPet.create(body);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: record }));
  },

  async deleteLostPet(req, res, id) {
    const deleted = await LostPet.delete(id);
    if (!deleted) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Lost pet report not found" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Lost pet report deleted successfully" }));
  },
};
