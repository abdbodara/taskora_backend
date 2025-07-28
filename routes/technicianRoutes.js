const express = require("express");
const { validate, TechnicianValidation } = require("../middlewares/validation");
const {
  getTechnicians,
  getTechnician,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  changeTechnicianPassword,
  getTechnicianTasks,
} = require("../controllers/technicianController");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// GET /api/Technicians - Get all Technicians with pagination and search
router.get("/", roleMiddleware("admin"), getTechnicians);

// GET /api/Technicians/:id - Get single Technician
router.get("/:id", roleMiddleware("admin"), getTechnician);

// POST /api/Technicians - Create new Technician
router.post(
  "/",
  roleMiddleware("admin"),
  TechnicianValidation,
  validate,
  createTechnician
);

// PUT /api/Technicians/:id - Update Technician
router.put("/:id", roleMiddleware("admin"), validate, updateTechnician);

// DELETE /api/Technicians/:id - Delete Technician (soft delete)
router.delete("/:id", roleMiddleware("admin"), deleteTechnician);

//change password
router.put(
  "/change-password/:id",
  roleMiddleware("admin"),
  changeTechnicianPassword
);

// GET /api/Technicians/tasks - Get Technician tasks
router.get("/assigned/tasks", roleMiddleware("technician"), getTechnicianTasks);

module.exports = router;
