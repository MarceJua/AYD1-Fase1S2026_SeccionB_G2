const express = require("express");
const router = express.Router();
const upload = require("../config/multer"); // Importamos el configurador de fotos
const {
  registrarPaciente,
  loginPaciente,
  registrarMedico,
  loginMedico,
} = require("../controllers/authController");

// Rutas para el paciente
router.post("/paciente/registro", registrarPaciente);
router.post("/paciente/login", loginPaciente);

// Rutas para el médico (HU-002)
// Ruta para el registro médico con Multer (Foto obligatoria)
router.post("/medico/registro", upload.single("foto"), registrarMedico);
router.post("/medico/login", loginMedico);

module.exports = router;