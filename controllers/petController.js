import { Pet } from "../models/Pet.js";

export const petController = {
  async getPets(req, res) {
    const pets = await Pet.findAll();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: pets }));
  },

  async getPetById(req, res, id) {
    const pet = await Pet.findById(id);
    if (!pet) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Pet not found" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: pet }));
  },

  async createPet(req, res) {
    const body = req.body || {};
    if (!body.name) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Pet name is required" }));
      return;
    }
    const newPet = await Pet.create(body);
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, data: newPet }));
  },

  async deletePet(req, res, id) {
    const deleted = await Pet.delete(id);
    if (!deleted) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, message: "Pet not found" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Pet deleted successfully" }));
  },
};
