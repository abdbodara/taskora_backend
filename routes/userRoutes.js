const express = require("express");
const { param } = require("express-validator");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const {
  validate,
  profileValidation,
  queryValidation,
  userUpdateValidation,
} = require("../middlewares/validation");
const {
  getCurrentUser,
  updateProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

// Current user routes
router.get("/me", getCurrentUser);
router.put("/me", profileValidation, validate, updateProfile);

// Admin routes
router.get("/", role("admin"), queryValidation, validate, getUsers);
router.get(
  "/:id",
  role("admin"),
  [param("id").isInt().withMessage("User ID must be an integer")],
  validate,
  getUserById
);
router.put(
  "/:id",
  role("admin"),
  [
    param("id").isInt().withMessage("User ID must be an integer"),
    ...userUpdateValidation,
  ],
  validate,
  updateUser
);
router.delete(
  "/:id",
  role("admin"),
  [param("id").isInt().withMessage("User ID must be an integer")],
  validate,
  deleteUser
);

module.exports = router;
