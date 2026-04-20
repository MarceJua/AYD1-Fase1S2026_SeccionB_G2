const pool = require("../config/db");
const nodemailer = require("nodemailer");

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
 * Cambia el estado de la cita a 'Atendido', guarda el diagnóstico y los medicamentos (HU-203)
 */
const atenderPaciente = async (req, res) => {
  const medicoId = req.medico.id;
  const citaId = req.params.id;
  const { diagnostico, medicamentos } = req.body;

  if (!diagnostico || diagnostico.trim() === "") {
    return res.status(400).json({ error: "El diagnóstico es obligatorio." });
  }
  if (!medicamentos || !Array.isArray(medicamentos) || medicamentos.length === 0) {
    return res.status(400).json({ error: "Debe agregar al menos un medicamento." });
  }
  for (const med of medicamentos) {
    if (!med.nombre?.trim() || !med.cantidad?.trim() || !med.tiempo?.trim() || !med.descripcion_dosis?.trim()) {
      return res.status(400).json({ error: "Todos los campos de cada medicamento son obligatorios." });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateQuery = `
      UPDATE citas
      SET estado = 'Atendido', diagnostico = $1
      WHERE id = $2 AND medico_id = $3 AND estado = 'activa'
      RETURNING id
    `;
    const result = await client.query(updateQuery, [diagnostico.trim(), citaId, medicoId]);

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Cita no encontrada o ya fue procesada." });
    }

    for (const med of medicamentos) {
      await client.query(
        `INSERT INTO medicamentos (cita_id, nombre, cantidad, tiempo, descripcion_dosis)
         VALUES ($1, $2, $3, $4, $5)`,
        [citaId, med.nombre.trim(), med.cantidad.trim(), med.tiempo.trim(), med.descripcion_dosis.trim()]
      );
    }

    await client.query("COMMIT");
    res.json({ mensaje: "Paciente atendido correctamente." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al atender paciente:", error);
    res.status(500).json({ error: "Error interno al actualizar la cita." });
  } finally {
    client.release();
  }
};

/**
 * PUT /api/medico/citas/:id/cancelar
 * Cancela la cita y envía un correo de notificación al paciente
 */
const cancelarCita = async (req, res) => {
  const medicoId = req.medico.id;
  const citaId = req.params.id;

  try {
    // 1. Obtener la información completa para el correo (hacemos JOIN con paciente y médico)
    const queryData = `
      SELECT 
        c.fecha, c.hora, c.motivo, 
        p.correo AS paciente_correo, p.nombre AS paciente_nombre, p.apellido AS paciente_apellido,
        m.nombre AS medico_nombre, m.apellido AS medico_apellido
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN medicos m ON c.medico_id = m.id
      WHERE c.id = $1 AND c.medico_id = $2 AND c.estado = 'activa'
    `;
    const resultData = await pool.query(queryData, [citaId, medicoId]);

    if (resultData.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Cita no encontrada o ya no está activa." });
    }

    const citaInfo = resultData.rows[0];

    // 2. Actualizar el estado de la cita en la base de datos
    const updateQuery = `
      UPDATE citas
      SET estado = 'Cancelada por médico'
      WHERE id = $1
    `;
    await pool.query(updateQuery, [citaId]);

    // 3. Configurar Nodemailer para enviar el correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Formatear la fecha para que se vea bonita en el correo
    const fechaFormateada = new Date(citaInfo.fecha).toLocaleDateString(
      "es-ES",
      { timeZone: "UTC" },
    );

    // 4. Redactar y enviar el correo con los datos mínimos solicitados
    const mailOptions = {
      from: `"Clínica SaludPlus" <${process.env.EMAIL_USER}>`,
      to: citaInfo.paciente_correo,
      subject: "Aviso Importante: Cancelación de Cita Médica",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #d9534f;">Cita Cancelada</h2>
          <p>Estimado/a <strong>${citaInfo.paciente_nombre} ${citaInfo.paciente_apellido}</strong>,</p>
          <p>Le escribimos para notificarle que lamentablemente su cita médica ha sido cancelada debido a contratiempos imprevistos del profesional de la salud.</p>
          
          <h3>Detalles de la cita cancelada:</h3>
          <ul>
            <li><strong>Médico:</strong> Dr/Dra. ${citaInfo.medico_nombre} ${citaInfo.medico_apellido}</li>
            <li><strong>Fecha:</strong> ${fechaFormateada}</li>
            <li><strong>Hora:</strong> ${citaInfo.hora}</li>
            <li><strong>Motivo original:</strong> ${citaInfo.motivo}</li>
          </ul>

          <p><strong>Mensaje del médico:</strong> <em>"Le pido mis más sinceras disculpas por los inconvenientes que esta cancelación pueda causarle. Le invito a programar una nueva cita a través de la plataforma."</em></p>
          
          <p>Atentamente,<br>El equipo de SaludPlus</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ mensaje: "Cita cancelada y correo enviado exitosamente." });
  } catch (error) {
    console.error("Error al cancelar la cita:", error);
    res
      .status(500)
      .json({ error: "Error interno al cancelar la cita o enviar el correo." });
  }
};

/**
 * GET /api/medico/citas/historial
 * Obtiene el historial de citas (Atendido, Cancelada por médico, Cancelada por paciente)
 */
const obtenerHistorialCitas = async (req, res) => {
  const medicoId = req.medico.id;

  try {
    const query = `
      SELECT 
        c.id AS cita_id, 
        c.fecha, 
        c.hora, 
        c.estado, 
        p.nombre AS paciente_nombre, 
        p.apellido AS paciente_apellido
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.medico_id = $1 AND c.estado != 'activa'
      ORDER BY c.fecha DESC, c.hora DESC
    `;

    const result = await pool.query(query, [medicoId]);

    res.json({ historial: result.rows });
  } catch (error) {
    console.error("Error al obtener el historial de citas:", error);
    res.status(500).json({ error: "Error interno al obtener el historial." });
  }
};

/**
 * POST /api/medico/citas/calificar-paciente
 * HU-205: Médico califica a Paciente
 */
const calificarPaciente = async (req, res) => {
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
      VALUES ($1, 'medico', $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [cita_id, estrellas, comentario]);

    res.status(201).json({ mensaje: "Paciente calificado exitosamente.", calificacion: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: "Ya has calificado a este paciente por esta cita." });
    }
    console.error("Error al calificar paciente:", error);
    res.status(500).json({ error: "Error interno al guardar la calificación." });
  }
};
  
module.exports = {
  obtenerCitasPendientes,
  atenderPaciente,
  cancelarCita,
  obtenerHistorialCitas,
  calificarPaciente,
};
