const pool = require('../config/db');

/**
 * GET /api/medico/horarios
 * Obtiene el horario actual del médico autenticado.
 * Si no tiene horario configurado aún, retorna null en el campo horario.
 */
const obtenerHorario = async (req, res) => {
  const medicoId = req.medico.id; // Viene del middleware verifyMedicoToken

  try {
    const result = await pool.query(
      'SELECT id, dias, hora_inicio, hora_fin FROM horario_medico WHERE medico_id = $1',
      [medicoId]
    );

    if (result.rows.length === 0) {
      // Aún no ha configurado horario — el frontend usará esto para mostrar "Guardar"
      return res.json({ horario: null });
    }

    res.json({ horario: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener horario:', error.message);
    res.status(500).json({ error: 'Error al obtener el horario del médico' });
  }
};

/**
 * POST /api/medico/horarios
 * Guarda el horario del médico por primera vez.
 * Si ya existe un horario, retorna 409 para que el frontend use PUT.
 */
const guardarHorario = async (req, res) => {
  const medicoId = req.medico.id;
  const { dias, hora_inicio, hora_fin } = req.body;

  // Validaciones básicas
  if (!dias || !Array.isArray(dias) || dias.length === 0) {
    return res.status(400).json({ error: 'Debe seleccionar al menos un día' });
  }
  if (!hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Debe especificar hora de inicio y fin' });
  }
  if (hora_inicio >= hora_fin) {
    return res.status(400).json({ error: 'La hora de inicio debe ser anterior a la hora de fin' });
  }

  try {
    // Verificar si ya tiene horario
    const existente = await pool.query(
      'SELECT id FROM horario_medico WHERE medico_id = $1',
      [medicoId]
    );

    if (existente.rows.length > 0) {
      return res.status(409).json({
        error: 'El médico ya tiene un horario configurado. Use PUT para actualizarlo',
      });
    }

    // Insertar nuevo horario
    const result = await pool.query(
      `INSERT INTO horario_medico (medico_id, dias, hora_inicio, hora_fin)
       VALUES ($1, $2, $3, $4)
       RETURNING id, dias, hora_inicio, hora_fin`,
      [medicoId, dias, hora_inicio, hora_fin]
    );

    res.status(201).json({
      mensaje: 'Horario guardado correctamente',
      horario: result.rows[0],
    });
  } catch (error) {
    console.error('Error al guardar horario:', error.message);
    res.status(500).json({ error: 'Error al guardar el horario del médico' });
  }
};

/**
 * PUT /api/medico/horarios
 * Actualiza el horario del médico.
 * VALIDACIÓN CLAVE: Si hay citas activas/pendientes fuera del nuevo rango
 * horario, NO se permite la actualización hasta que sean reprogramadas o canceladas.
 */
const actualizarHorario = async (req, res) => {
  const medicoId = req.medico.id;
  const { dias, hora_inicio, hora_fin } = req.body;

  // Validaciones básicas
  if (!dias || !Array.isArray(dias) || dias.length === 0) {
    return res.status(400).json({ error: 'Debe seleccionar al menos un día' });
  }
  if (!hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Debe especificar hora de inicio y fin' });
  }
  if (hora_inicio >= hora_fin) {
    return res.status(400).json({ error: 'La hora de inicio debe ser anterior a la hora de fin' });
  }

  try {
    // ──────────────────────────────────────────────────────────────────────
    // VALIDACIÓN DE CITAS ACTIVAS FUERA DEL NUEVO RANGO HORARIO
    // Se buscan citas activas/pendientes del médico cuya hora esté
    // antes del nuevo hora_inicio O igual/después del nuevo hora_fin.
    // ──────────────────────────────────────────────────────────────────────
    const citasConflictivas = await pool.query(
      `SELECT c.id, c.fecha, c.hora, c.estado,
              p.nombre AS paciente_nombre, p.apellido AS paciente_apellido
       FROM citas c
       JOIN pacientes p ON p.id = c.paciente_id
       WHERE c.medico_id = $1
         AND c.estado IN ('activa', 'pendiente')
         AND (c.hora < $2::TIME OR c.hora >= $3::TIME)`,
      [medicoId, hora_inicio, hora_fin]
    );

    if (citasConflictivas.rows.length > 0) {
      return res.status(409).json({
        error:
          'No se puede actualizar el horario. Hay citas activas fuera del nuevo rango horario. Debe reprogramarlas o cancelarlas primero.',
        citas_conflictivas: citasConflictivas.rows,
      });
    }

    // Verificar que existe el horario (para poder hacer UPDATE)
    const existente = await pool.query(
      'SELECT id FROM horario_medico WHERE medico_id = $1',
      [medicoId]
    );

    if (existente.rows.length === 0) {
      return res.status(404).json({
        error: 'No existe un horario para este médico. Use POST para crearlo',
      });
    }

    // Actualizar horario
    const result = await pool.query(
      `UPDATE horario_medico
       SET dias = $1, hora_inicio = $2, hora_fin = $3
       WHERE medico_id = $4
       RETURNING id, dias, hora_inicio, hora_fin`,
      [dias, hora_inicio, hora_fin, medicoId]
    );

    res.json({
      mensaje: 'Horario actualizado correctamente',
      horario: result.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar horario:', error.message);
    res.status(500).json({ error: 'Error al actualizar el horario del médico' });
  }
};

module.exports = {
  obtenerHorario,
  guardarHorario,
  actualizarHorario,
};
