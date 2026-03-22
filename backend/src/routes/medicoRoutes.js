// backend/src/routes/medicoRoutes.js
// Rutas para la gestión del horario del médico (HU-009) y perfil (HU-013)
const express = require('express');
const router = express.Router();
const verifyMedicoToken = require('../middlewares/verifyMedicoToken');
const upload = require('../config/multer');
const {
  obtenerHorario,
  guardarHorario,
  actualizarHorario,
} = require('../controllers/horarioController');
const {
  obtenerPerfilMedico,
  actualizarPerfilMedico,
} = require('../controllers/perfilMedicoController');

// GET  /api/medico/horarios ->  obtener horario actual del médico autenticado
router.get('/horarios', verifyMedicoToken, obtenerHorario);

// POST /api/medico/horarios -> guardar horario por primera vez
router.post('/horarios', verifyMedicoToken, guardarHorario);

// PUT  /api/medico/horarios -> actualizar horario (con validación de citas activas)
router.put('/horarios', verifyMedicoToken, actualizarHorario);

// GET  /api/medico/perfil -> obtener perfil del médico autenticado (HU-013)
router.get('/perfil', verifyMedicoToken, obtenerPerfilMedico);

// PUT  /api/medico/perfil -> actualizar perfil (foto opcional) (HU-013)
router.put('/perfil', verifyMedicoToken, upload.single('foto'), actualizarPerfilMedico);

module.exports = router;
