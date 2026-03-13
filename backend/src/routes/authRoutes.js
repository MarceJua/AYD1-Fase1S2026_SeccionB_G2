const express = require("express");
const router = express.Router();
const upload = require("../config/multer"); // Importamos el configurador de fotos
const verifyAdminToken = require("../middlewares/verifyAdminToken");
const {
  registrarPaciente,
  loginPaciente,
  registrarMedico,
  loginMedico,
  loginAdmin,
  validar2FA,
  obtenerMedicosPendientes,
  aprobarMedico,
  rechazarMedico,
} = require("../controllers/authController");

// Rutas para el paciente
router.post("/paciente/registro", registrarPaciente);
router.post("/paciente/login", loginPaciente);
// Rutas para el médico (HU-002)
// Ruta para el registro médico con Multer (Foto obligatoria)
router.post("/medico/registro", upload.single("foto"), registrarMedico);
router.post("/medico/login", loginMedico);
// Rutas para el administrador (HU-004) - Autenticación de 2 factores
router.post("/admin/login", loginAdmin); // Primer factor
router.post("/admin/validar-2fa", validar2FA); // Segundo factor
// Rutas para el modulo administrador (HU-005) - Gestión de médicos pendientes
router.get("/admin/medicos-pendientes", obtenerMedicosPendientes);
router.post("/admin/aprobar-medico/:id", aprobarMedico);
router.post("/admin/rechazar-medico/:id", rechazarMedico);

module.exports = router;
