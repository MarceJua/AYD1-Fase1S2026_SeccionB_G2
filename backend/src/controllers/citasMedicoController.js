const pool = require("../config/db");

/**
 * GET /api/medico/citas/pendientes
 * Obtiene las citas activas del médico, ordenadas por fecha y hora más próxima.
 */
const obtenerCitasPendientes = async (req, res) => {
  const medicoId = req.medico.id;

  try {
    const query = `
      SELECT 
        c.id AS cita_id, 
        c.fecha, 
        c.hora, 
        c.motivo, 
        p.nombre AS paciente_nombre, 
        p.apellido AS paciente_apellido
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.medico_id = $1 AND c.estado = 'activa'
      ORDER BY c.fecha ASC, c.hora ASC
    `;

    const result = await pool.query(query, [medicoId]);

    res.json({ citas: result.rows });
  } catch (error) {
    console.error("Error al obtener citas pendientes:", error);
    res
      .status(500)
      .json({ error: "Error interno al obtener las citas pendientes." });
  }
};

module.exports = {
  obtenerCitasPendientes,
};
