// backend/src/routes/medicoRoutes.js
// Rutas para la gestión del horario del médico (HU-009)
const express = require('express');
const router = express.Router();
const verifyMedicoToken = require('../middlewares/verifyMedicoToken');
const {
  obtenerHorario,
  guardarHorario,
  actualizarHorario,
} = require('../controllers/horarioController');

// GET  /api/medico/horarios → obtener horario actual del médico autenticado
router.get('/horarios', verifyMedicoToken, obtenerHorario);

// POST /api/medico/horarios → guardar horario por primera vez
router.post('/horarios', verifyMedicoToken, guardarHorario);

// PUT  /api/medico/horarios → actualizar horario (con validación de citas activas)
router.put('/horarios', verifyMedicoToken, actualizarHorario);

module.exports = router;
