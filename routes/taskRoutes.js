const express = require("express");
const auth = require("../middlewares/authMiddleware");
const {
  validate,
  getTasksValidation,
  taskValidation,
} = require("../middlewares/validation");
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  technicianUpdateTaskStatus,
} = require("../controllers/taskController");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { addCommentToTask, getTaskComments } = require("../controllers/commentController");

const router = express.Router();

// GET /api/tasks - Get all tasks with pagination and filtering
router.get(
  "/",
  roleMiddleware("admin"),
  getTasksValidation,
  validate,
  getTasks
);

// GET /api/tasks/:id - Get single task
router.get(
  "/:id",
  getTasksValidation,
  validate,
  roleMiddleware("admin"),
  getTask
);

// POST /api/tasks - Create new task
router.post("/", roleMiddleware("admin"), taskValidation, validate, createTask);

// PUT /api/tasks/:id - Update task
router.put("/:id", roleMiddleware("admin"), validate, updateTask);

// DELETE /api/tasks/:id - Delete task (soft delete)
router.delete("/:id", roleMiddleware("admin"), deleteTask);

// Update task status
router.put(
  "/status/:id",
  roleMiddleware("technician"),
  validate,
  technicianUpdateTaskStatus
);

// Add comment to task
router.post(
  "/comments/:taskId",
  roleMiddleware("technician"),
  addCommentToTask
);
 
// GET /api/tasks - Get all tasks with pagination and filtering
router.get(
  "/:taskId/comments", // 👈 matches your URL
  roleMiddleware("admin"),
  getTasksValidation,
  validate,
  getTaskComments
);

module.exports = router;