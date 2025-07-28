const express = require("express");
const {
  login,
  register,
  technicianLogin,
} = require("../controllers/authController");
const {
  loginValidation,
  registerValidation,
  validate,
} = require("../middlewares/validation");

const router = express.Router();

// Login route with validation
router.post("/login", loginValidation, validate, login);

router.post("/technician-login", loginValidation, validate, technicianLogin);

// Register route with validation
router.post("/register", registerValidation, validate, register);

module.exports = router;
