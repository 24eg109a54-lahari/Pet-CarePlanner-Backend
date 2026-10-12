import { authController } from "../controllers/authController.js";
import { healthController } from "../controllers/healthController.js";
import { lostPetController } from "../controllers/lostPetController.js";
import { medicineController } from "../controllers/medicineController.js";
import { petController } from "../controllers/petController.js";
import { reminderController } from "../controllers/reminderController.js";
import { taskController } from "../controllers/taskController.js";
import { vaccinationController } from "../controllers/vaccinationController.js";

export async function handleApiRoutes(req, res, pathname) {
  const method = req.method;

  // Health / Status endpoint
  if (pathname === "/api/status" || pathname === "/api/health-check") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        app: "Pet Care Planner API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      })
    );
    return true;
  }

  // Auth routes
  if (pathname === "/api/auth/register" && method === "POST") {
    await authController.register(req, res);
    return true;
  }
  if (pathname === "/api/auth/login" && method === "POST") {
    await authController.login(req, res);
    return true;
  }

  // Pets
  if (pathname === "/api/pets") {
    if (method === "GET") {
      await petController.getPets(req, res);
      return true;
    }
    if (method === "POST") {
      await petController.createPet(req, res);
      return true;
    }
  }
  const petMatch = pathname.match(/^\/api\/pets\/([^/]+)$/);
  if (petMatch) {
    const id = petMatch[1];
    if (method === "GET") {
      await petController.getPetById(req, res, id);
      return true;
    }
    if (method === "DELETE") {
      await petController.deletePet(req, res, id);
      return true;
    }
  }

  // Tasks
  if (pathname === "/api/tasks") {
    if (method === "GET") {
      await taskController.getTasks(req, res);
      return true;
    }
    if (method === "POST") {
      await taskController.createTask(req, res);
      return true;
    }
  }
  const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (taskMatch && method === "DELETE") {
    await taskController.deleteTask(req, res, taskMatch[1]);
    return true;
  }

  // Vaccinations
  if (pathname === "/api/vaccinations") {
    if (method === "GET") {
      await vaccinationController.getVaccinations(req, res);
      return true;
    }
    if (method === "POST") {
      await vaccinationController.createVaccination(req, res);
      return true;
    }
  }
  const vacMatch = pathname.match(/^\/api\/vaccinations\/([^/]+)$/);
  if (vacMatch && method === "DELETE") {
    await vaccinationController.deleteVaccination(req, res, vacMatch[1]);
    return true;
  }

  // Reminders
  if (pathname === "/api/reminders") {
    if (method === "GET") {
      await reminderController.getReminders(req, res);
      return true;
    }
    if (method === "POST") {
      await reminderController.createReminder(req, res);
      return true;
    }
  }
  const remMatch = pathname.match(/^\/api\/reminders\/([^/]+)$/);
  if (remMatch && method === "DELETE") {
    await reminderController.deleteReminder(req, res, remMatch[1]);
    return true;
  }

  // Medicines
  if (pathname === "/api/medicines") {
    if (method === "GET") {
      await medicineController.getMedicines(req, res);
      return true;
    }
    if (method === "POST") {
      await medicineController.createMedicine(req, res);
      return true;
    }
  }
  const medMatch = pathname.match(/^\/api\/medicines\/([^/]+)$/);
  if (medMatch && method === "DELETE") {
    await medicineController.deleteMedicine(req, res, medMatch[1]);
    return true;
  }

  // Health records
  if (pathname === "/api/health") {
    if (method === "GET") {
      await healthController.getHealthRecords(req, res);
      return true;
    }
    if (method === "POST") {
      await healthController.createHealthRecord(req, res);
      return true;
    }
  }
  const healthMatch = pathname.match(/^\/api\/health\/([^/]+)$/);
  if (healthMatch && method === "DELETE") {
    await healthController.deleteHealthRecord(req, res, healthMatch[1]);
    return true;
  }

  // Lost Pets
  if (pathname === "/api/lost-pets") {
    if (method === "GET") {
      await lostPetController.getLostPets(req, res);
      return true;
    }
    if (method === "POST") {
      await lostPetController.createLostPet(req, res);
      return true;
    }
  }
  const lostMatch = pathname.match(/^\/api\/lost-pets\/([^/]+)$/);
  if (lostMatch && method === "DELETE") {
    await lostPetController.deleteLostPet(req, res, lostMatch[1]);
    return true;
  }

  return false;
}
