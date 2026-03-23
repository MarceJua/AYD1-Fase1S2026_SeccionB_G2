// backend/routes/pacienteRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Tu conexión a la BD
const { programarCita } = require("../controllers/pacienteController");

// Ruta para programar cita (HU-008)
router.post("/programar-cita", programarCita);

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

// Actualizar perfil del paciente
router.put("/perfil/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, correo } = req.body;

  try {
    // Verificamos si el nuevo correo ya le pertenece a OTRO usuario (para no duplicar)
    const checkCorreo = await pool.query(
      "SELECT id FROM pacientes WHERE correo = $1 AND id != $2",
      [correo, id],
    );

    if (checkCorreo.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Este correo ya está en uso por otra cuenta." });
    }

    // Actualizamos los datos
    const updateQuery = `
      UPDATE pacientes 
      SET nombre = $1, correo = $2 
      WHERE id = $3 
      RETURNING id, nombre, dpi, correo
    `;
    const result = await pool.query(updateQuery, [nombre, correo, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Paciente no encontrado." });
    }

    res.json({
      mensaje: "Perfil actualizado correctamente",
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("💥 Error actualizando perfil:", error);
    res.status(500).json({ error: "Error interno al actualizar el perfil" });
  }
});

module.exports = router;
