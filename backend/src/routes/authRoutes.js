const express = require("express");
const router = express.Router();
const {
  registrarPaciente,
  loginPaciente,
} = require("../controllers/authController");

// Rutas para el paciente
router.post("/paciente/registro", registrarPaciente);
router.post("/paciente/login", loginPaciente);

module.exports = router;
