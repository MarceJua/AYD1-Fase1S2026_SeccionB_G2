// backend/src/controllers/pacienteController.js
const pool = require("../config/db");

const programarCita = async (req, res) => {
  const { medico_id, paciente_id, fecha, hora, motivo } = req.body;

  try {
    // 1. Obtener el horario del médico
    const horarioRes = await pool.query(
      "SELECT dias, hora_inicio, hora_fin FROM horario_medico WHERE medico_id = $1",
      [medico_id]
    );

    if (horarioRes.rows.length === 0) {
      return res.status(400).json({ error: "El médico no ha establecido un horario de atención." });
    }

    const { dias, hora_inicio, hora_fin } = horarioRes.rows[0];

    // 2. Validación: Día de atención
    // Convertir fecha string a día de la semana en español
    const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const diaSeleccionado = diasSemana[new Date(fecha + "T12:00:00").getDay()];

    if (!dias.includes(diaSeleccionado)) {
      return res.status(400).json({ error: `El médico no atiende los días ${diaSeleccionado}.` });
    }

    // 3. Validación: Rango de hora (Entre inicio y fin)
    if (hora < hora_inicio || hora >= hora_fin) {
      return res.status(400).json({ error: `La hora debe estar entre ${hora_inicio} y ${hora_fin}.` });
    }

    // 4. Validación: El médico ya tiene una cita a esa hora
    const citaMedicoOcupado = await pool.query(
      "SELECT id FROM citas WHERE medico_id = $1 AND fecha = $2 AND hora = $3 AND estado = 'activa'",
      [medico_id, fecha, hora]
    );
    if (citaMedicoOcupado.rows.length > 0) {
      return res.status(400).json({ error: "El horario seleccionado ya está ocupado para este médico." });
    }

    // 5. Validación: Paciente ya tiene cita con ESTE médico
    const citaDuplicadaMedico = await pool.query(
      "SELECT id FROM citas WHERE paciente_id = $1 AND medico_id = $2 AND estado = 'activa'",
      [paciente_id, medico_id]
    );
    if (citaDuplicadaMedico.rows.length > 0) {
      return res.status(400).json({ error: "Ya tienes una cita activa con este médico." });
    }

    // 6. Validación: Paciente ya tiene otra cita a la MISMA hora (Traslape personal)
    const citaTraslapePaciente = await pool.query(
      "SELECT id FROM citas WHERE paciente_id = $1 AND fecha = $2 AND hora = $3 AND estado = 'activa'",
      [paciente_id, fecha, hora]
    );
    if (citaTraslapePaciente.rows.length > 0) {
      return res.status(400).json({ error: "Ya tienes otra cita programada para este mismo día y hora." });
    }

    // 7. Si todo es válido, insertar la cita
    const nuevaCita = await pool.query(
      "INSERT INTO citas (medico_id, paciente_id, fecha, hora, motivo, estado) VALUES ($1, $2, $3, $4, $5, 'activa') RETURNING *",
      [medico_id, paciente_id, fecha, hora, motivo]
    );

    res.status(201).json({
      mensaje: "Cita programada exitosamente",
      cita: nuevaCita.rows[0]
    });

  } catch (error) {
    console.error("Error al programar cita:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// HU-205: Paciente califica a Médico
const calificarMedico = async (req, res) => {
  const { cita_id, estrellas, comentario } = req.body;

  if (estrellas < 0 || estrellas > 5) {
    return res.status(400).json({ error: "Las estrellas deben estar entre 0 y 5." });
  }

  try {
    const citaQuery = await pool.query(
      "SELECT estado FROM citas WHERE id = $1",
      [cita_id]
    );

    if (citaQuery.rows.length === 0) {
      return res.status(404).json({ error: "Cita no encontrada." });
    }

    if (citaQuery.rows[0].estado.toLowerCase() !== "atendido") {
      return res.status(400).json({ error: "Solo se pueden calificar citas con estado 'Atendido'." });
    }

    const insertQuery = `
      INSERT INTO calificaciones (cita_id, evaluador_rol, estrellas, comentario)
      VALUES ($1, 'paciente', $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [cita_id, estrellas, comentario]);

    res.status(201).json({ mensaje: "Médico calificado exitosamente.", calificacion: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: "Ya has calificado esta cita anteriormente." });
    }
    console.error("Error al calificar médico:", error);
    res.status(500).json({ error: "Error interno al guardar la calificación." });
  }
};

module.exports = { programarCita, calificarMedico };