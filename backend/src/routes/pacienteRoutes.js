// backend/routes/pacienteRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Tu conexión a la BD

// Obtener todos los médicos aprobados
router.get("/medicos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, especialidad, direccion_clinica, foto FROM medicos WHERE estado = 'aprobado'",
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la lista de médicos" });
  }
});

module.exports = router;
