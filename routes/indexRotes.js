const authRoutes = require("./authRoutes");
const technicianRoutes = require("./technicianRoutes");
const taskRoutes = require("./taskRoutes");
const userRoutes = require("./userRoutes");
const authMiddleware = require("../middlewares/authMiddleware");
const { Router } = require("express");

const router = Router();

router.use("/auth", authRoutes);
router.use(authMiddleware);
router.use("/technicians", technicianRoutes);
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);

module.exports = router;
