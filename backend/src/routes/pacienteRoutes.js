// backend/routes/pacienteRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Tu conexión a la BD
const { programarCita, calificarMedico } = require("../controllers/pacienteController");

// Ruta para programar cita (HU-008)
router.post("/programar-cita", programarCita);

// Ruta para calificar médico (HU-205)
router.post("/calificar-medico", calificarMedico);

// Obtener todos los médicos aprobados
router.get("/medicos", async (req, res) => {
  const { paciente_id } = req.query;

  try {
    const pacienteIdNum = Number(paciente_id);
    const filtroPacienteValido =
      paciente_id !== undefined &&
      Number.isInteger(pacienteIdNum) &&
      pacienteIdNum > 0;

    const result = await pool.query(
      `SELECT m.id, m.nombre, m.apellido, m.especialidad, m.direccion_clinica, m.foto
       FROM medicos m
       WHERE m.estado = 'aprobado'
         AND (
           $1::int IS NULL
           OR NOT EXISTS (
             SELECT 1
             FROM citas c
             WHERE c.medico_id = m.id
               AND c.paciente_id = $1
               AND c.estado = 'activa'
           )
         )
       ORDER BY m.nombre ASC, m.apellido ASC`,
      [filtroPacienteValido ? pacienteIdNum : null],
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la lista de médicos" });
  }
});

// HU-018: Obtener horario de un médico específico con slots para una fecha
router.get("/medicos/:id/horario", async (req, res) => {
  const { id } = req.params;
  const { fecha } = req.query;

  try {
    const horarioRes = await pool.query(
      "SELECT dias, hora_inicio, hora_fin FROM horario_medico WHERE medico_id = $1",
      [id],
    );

    if (horarioRes.rows.length === 0) {
      return res.json({ horario: null });
    }

    const horario = {
      dias: horarioRes.rows[0].dias,
      hora_inicio: horarioRes.rows[0].hora_inicio.slice(0, 5),
      hora_fin: horarioRes.rows[0].hora_fin.slice(0, 5),
    };

    if (!fecha) {
      return res.json({ horario });
    }

    const diasSemana = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];
    const diaSeleccionado = diasSemana[new Date(fecha + "T12:00:00").getDay()];

    if (!horario.dias.includes(diaSeleccionado)) {
      return res.json({
        horario,
        fecha,
        atiende_ese_dia: false,
        dia_semana: diaSeleccionado,
        slots: [],
      });
    }

    const citasRes = await pool.query(
      "SELECT hora FROM citas WHERE medico_id = $1 AND fecha = $2 AND estado = 'activa'",
      [id, fecha],
    );

    const horasOcupadas = citasRes.rows.map((c) => c.hora.slice(0, 5));

    const slots = [];
    const [hIni, mIni] = horario.hora_inicio.split(":").map(Number);
    const [hFin, mFin] = horario.hora_fin.split(":").map(Number);
    let totalMinutos = hIni * 60 + mIni;
    const finMinutos = hFin * 60 + mFin;

    while (totalMinutos < finMinutos) {
      const h = Math.floor(totalMinutos / 60);
      const m = totalMinutos % 60;
      const horaStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      slots.push({
        hora: horaStr,
        disponible: !horasOcupadas.includes(horaStr),
      });
      totalMinutos += 60;
    }

    return res.json({
      horario,
      fecha,
      atiende_ese_dia: true,
      dia_semana: diaSeleccionado,
      slots,
    });
  } catch (error) {
    console.error("Error al obtener horario del médico:", error);
    res.status(500).json({ error: "Error al obtener el horario del médico" });
  }
});

// HU-019: Obtener citas activas del paciente (pendientes de atencion)
router.get("/mis-citas/:paciente_id", async (req, res) => {
  const { paciente_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.id, c.fecha, c.hora, c.motivo,
              m.nombre AS medico_nombre, m.apellido AS medico_apellido,
              m.direccion_clinica
       FROM citas c
       JOIN medicos m ON m.id = c.medico_id
       WHERE c.paciente_id = $1 AND c.estado = 'activa'
       ORDER BY c.fecha ASC, c.hora ASC`,
      [paciente_id],
    );

    res.json({ citas: result.rows });
  } catch (error) {
    console.error("Error al obtener citas del paciente:", error);
    res.status(500).json({ error: "Error al obtener las citas" });
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

// HU-019: Cancelar cita del paciente (Valida regla de 24 horas)
router.put("/cita/:cita_id/cancelar", async (req, res) => {
  const { cita_id } = req.params;

  try {
    // 1. Obtener los datos de la cita para validar la fecha/hora
    const citaQuery = await pool.query(
      "SELECT fecha, hora, estado FROM citas WHERE id = $1",
      [cita_id],
    );

    if (citaQuery.rows.length === 0) {
      return res.status(404).json({ error: "Cita no encontrada." });
    }

    const cita = citaQuery.rows[0];

    if (cita.estado !== "activa") {
      return res
        .status(400)
        .json({ error: "Solo se pueden cancelar citas activas." });
    }

    // 2. Regla de Negocio: Validar que falten al menos 24 horas
    // Formateamos la fecha de la base de datos y la hora
    const fechaCitaStr = cita.fecha.toISOString().split("T")[0];
    const citaDateTime = new Date(`${fechaCitaStr}T${cita.hora}`);
    const ahora = new Date();

    // Calculamos la diferencia en milisegundos y la convertimos a horas
    const diffHoras = (citaDateTime - ahora) / (1000 * 60 * 60);

    if (diffHoras < 24) {
      return res.status(400).json({
        error:
          "No se puede cancelar la cita. Debe hacerse con al menos 24 horas de anticipación.",
      });
    }

    // 3. Cancelar la cita si pasa la validación
    await pool.query("UPDATE citas SET estado = 'cancelada' WHERE id = $1", [
      cita_id,
    ]);

    res.json({ mensaje: "Cita cancelada exitosamente." });
  } catch (error) {
    console.error("Error al cancelar la cita:", error);
    res.status(500).json({ error: "Error al procesar la cancelación." });
  }
});

// HU-019 + HU-203: Obtener historial de citas con diagnóstico y medicamentos estructurados
router.get("/historial-citas/:paciente_id", async (req, res) => {
  const { paciente_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.id, c.fecha, c.hora, c.motivo, c.estado, c.tratamiento, c.diagnostico,
              CASE
                WHEN LOWER(c.estado) = 'atendido' OR LOWER(c.estado) = 'atendida' THEN 'Atendido'
                WHEN LOWER(c.estado) IN ('cancelada por médico', 'cancelada por medico') THEN 'Cancelada por médico'
                WHEN LOWER(c.estado) = 'cancelada por paciente' OR LOWER(c.estado) = 'cancelada' THEN 'Cancelada por paciente'
                ELSE c.estado
              END AS estado_mostrable,
              m.nombre AS medico_nombre, m.apellido AS medico_apellido,
              m.especialidad, m.direccion_clinica, m.numero_colegiado, m.telefono AS medico_telefono,
              COALESCE(
                json_agg(
                  json_build_object(
                    'nombre', med.nombre,
                    'cantidad', med.cantidad,
                    'tiempo', med.tiempo,
                    'descripcion_dosis', med.descripcion_dosis
                  ) ORDER BY med.id
                ) FILTER (WHERE med.id IS NOT NULL),
                '[]'::json
              ) AS medicamentos
       FROM citas c
       JOIN medicos m ON m.id = c.medico_id
       LEFT JOIN medicamentos med ON med.cita_id = c.id
       WHERE c.paciente_id = $1 AND LOWER(c.estado) <> 'activa'
       GROUP BY c.id, m.nombre, m.apellido, m.especialidad, m.direccion_clinica, m.numero_colegiado, m.telefono
       ORDER BY c.fecha DESC, c.hora DESC`,
      [paciente_id],
    );

    res.json({ historial: result.rows });
  } catch (error) {
    console.error("Error al obtener el historial:", error);
    res.status(500).json({ error: "Error al cargar el historial médico." });
  }
});

module.exports = router;
