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

module.exports = {
  obtenerCitasPendientes,
  atenderPaciente,
  cancelarCita,
  obtenerHistorialCitas,
};
