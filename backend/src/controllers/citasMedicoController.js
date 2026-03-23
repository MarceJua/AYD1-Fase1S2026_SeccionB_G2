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

/**
 * PUT /api/medico/citas/:id/atender
 * Cambia el estado de la cita a 'Atendido' y guarda el tratamiento
 */
const atenderPaciente = async (req, res) => {
  const medicoId = req.medico.id;
  const citaId = req.params.id;
  const { tratamiento } = req.body;

  if (!tratamiento || tratamiento.trim() === "") {
    return res.status(400).json({ error: "El tratamiento es obligatorio." });
  }

  try {
    const updateQuery = `
      UPDATE citas
      SET estado = 'Atendido', tratamiento = $1
      WHERE id = $2 AND medico_id = $3 AND estado = 'activa'
      RETURNING id
    `;

    const result = await pool.query(updateQuery, [
      tratamiento,
      citaId,
      medicoId,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Cita no encontrada o ya fue procesada." });
    }

    res.json({ mensaje: "Paciente atendido correctamente." });
  } catch (error) {
    console.error("Error al atender paciente:", error);
    res.status(500).json({ error: "Error interno al actualizar la cita." });
  }
};

module.exports = {
  obtenerCitasPendientes,
  atenderPaciente,
};
