const express = require("express");
const router = express.Router();
const upload = require("../config/multer"); // Importamos el configurador de fotos
const verifyAdminToken = require("../middlewares/verifyAdminToken");
const pool = require("../config/db");
const {
  registrarPaciente,
  loginPaciente,
  registrarMedico,
  loginMedico,
  loginAdmin,
  validar2FA,
  obtenerMedicosPendientes,
  aprobarMedico,
  rechazarMedico,
  obtenerPacientesPendientes,
  aprobarPaciente,
  rechazarPaciente,
  obtenerMedicosAprobados,
  obtenerPacientesAprobados,
  darBajaMedico,
  darBajaPaciente,
  reporteMedicosMasAtendidos,
  reporteEspecialidades,
  actualizarPacienteAdmin,
  actualizarMedicoAdmin,
} = require("../controllers/authController");

// Rutas para el paciente
router.post(
  "/paciente/registro",
  upload.fields([
    { name: "foto", maxCount: 1 },
    { name: "dpi_pdf", maxCount: 1 },
  ]),
  registrarPaciente,
);
router.post("/paciente/login", loginPaciente);
// Rutas para el médico (HU-002)
// Ruta para el registro médico con Multer (Foto obligatoria)
router.post(
  "/medico/registro",
  upload.fields([
    { name: "foto", maxCount: 1 },
    { name: "cv_pdf", maxCount: 1 },
  ]),
  registrarMedico,
);
router.post("/medico/login", loginMedico);
// Rutas para el administrador (HU-004) - Autenticación de 2 factores
router.post("/admin/login", loginAdmin); // Primer factor
router.post("/admin/validar-2fa", validar2FA); // Segundo factor
// Rutas para el modulo administrador (HU-005) - Gestión de médicos pendientes
router.get("/admin/medicos-pendientes", obtenerMedicosPendientes);
router.post("/admin/aprobar-medico/:id", aprobarMedico);
router.post("/admin/rechazar-medico/:id", rechazarMedico);
router.get("/admin/pacientes-pendientes", obtenerPacientesPendientes);
router.post("/admin/aprobar-paciente/:id", aprobarPaciente);
router.post("/admin/rechazar-paciente/:id", rechazarPaciente);
// Rutas para reportes (HU-012)
router.get("/admin/medicos-top", reporteMedicosMasAtendidos);
router.get("/admin/especialidades", reporteEspecialidades);
// Rutas para HU-014 (Dar de baja y ver aprobados)
router.get("/admin/medicos-aprobados", obtenerMedicosAprobados);
router.get("/admin/pacientes-aprobados", obtenerPacientesAprobados);
router.post("/admin/baja-medico/:id", darBajaMedico);
router.post("/admin/baja-paciente/:id", darBajaPaciente);

router.put("/admin/actualizar-paciente/:id", actualizarPacienteAdmin);
router.put("/admin/actualizar-medico/:id", actualizarMedicoAdmin);

// ============================================================================
// HU-208 y HU-209: REPORTES, CALIFICACIONES Y GRÁFICOS (Fase 2)
// ============================================================================

// HU-208: Obtener todas las denuncias/reportes con info de los involucrados
router.get("/admin/denuncias", async (req, res) => {
  try {
    const query = `
            SELECT r.id, r.cita_id, r.reportador_rol, r.categoria, r.explicacion, r.fecha_creacion,
                   c.fecha as fecha_cita,
                   p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.id as paciente_id,
                   m.nombre as medico_nombre, m.apellido as medico_apellido, m.id as medico_id
            FROM reportes r
            JOIN citas c ON r.cita_id = c.id
            JOIN pacientes p ON c.paciente_id = p.id
            JOIN medicos m ON c.medico_id = m.id
            ORDER BY r.fecha_creacion DESC
        `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo denuncias:", error);
    res.status(500).json({ error: "Error al obtener las denuncias" });
  }
});

// HU-208: Rechazar (eliminar) una denuncia
router.delete("/admin/denuncias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM reportes WHERE id = $1", [id]);
    res.json({ mensaje: "Denuncia rechazada/eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando denuncia:", error);
    res.status(500).json({ error: "Error al eliminar la denuncia" });
  }
});

// HU-208: Obtener promedios de calificaciones de todos los usuarios
router.get("/admin/calificaciones-promedios", async (req, res) => {
  try {
    // Promedios de Médicos (calificados por pacientes)
    const queryMedicos = `
            SELECT m.id, m.nombre, m.apellido, m.especialidad, 'medico' as rol,
                   ROUND(AVG(cal.estrellas), 1) as promedio, COUNT(cal.id) as total_evaluaciones
            FROM medicos m
            LEFT JOIN citas c ON m.id = c.medico_id
            LEFT JOIN calificaciones cal ON c.id = cal.cita_id AND cal.evaluador_rol = 'paciente'
            WHERE m.estado = 'aprobado'
            GROUP BY m.id
            HAVING COUNT(cal.id) > 0
            ORDER BY promedio DESC
        `;
    const resultMedicos = await pool.query(queryMedicos);

    // Promedios de Pacientes (calificados por médicos)
    const queryPacientes = `
            SELECT p.id, p.nombre, p.apellido, 'N/A' as especialidad, 'paciente' as rol,
                   ROUND(AVG(cal.estrellas), 1) as promedio, COUNT(cal.id) as total_evaluaciones
            FROM pacientes p
            LEFT JOIN citas c ON p.id = c.paciente_id
            LEFT JOIN calificaciones cal ON c.id = cal.cita_id AND cal.evaluador_rol = 'medico'
            WHERE p.estado = 'aprobado'
            GROUP BY p.id
            HAVING COUNT(cal.id) > 0
            ORDER BY promedio DESC
        `;
    const resultPacientes = await pool.query(queryPacientes);

    res.json({
      medicos: resultMedicos.rows,
      pacientes: resultPacientes.rows,
    });
  } catch (error) {
    console.error("Error obteniendo promedios:", error);
    res
      .status(500)
      .json({ error: "Error al obtener promedios de calificaciones" });
  }
});

// HU-209: Gráfico 1 - Horarios (franjas) más demandados
router.get("/admin/grafico-horarios", async (req, res) => {
  try {
    const query = `
            SELECT 
                CASE 
                    WHEN extract(hour from hora) < 12 THEN 'Mañana (Antes 12 PM)'
                    WHEN extract(hour from hora) >= 12 AND extract(hour from hora) < 17 THEN 'Tarde (12 PM - 5 PM)'
                    ELSE 'Noche (Después 5 PM)'
                END as franja_horaria,
                COUNT(id) as total_citas
            FROM citas
            GROUP BY franja_horaria
            ORDER BY total_citas DESC
        `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error en gráfico de horarios:", error);
    res.status(500).json({ error: "Error al generar datos del gráfico" });
  }
});

// HU-209: Gráfico 2 - Especialidades con más cancelaciones
router.get("/admin/grafico-cancelaciones", async (req, res) => {
  try {
    const query = `
            SELECT m.especialidad, COUNT(c.id) as total_canceladas
            FROM citas c
            JOIN medicos m ON c.medico_id = m.id
            WHERE c.estado = 'cancelada'
            GROUP BY m.especialidad
            ORDER BY total_canceladas DESC
        `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error en gráfico de cancelaciones:", error);
    res.status(500).json({ error: "Error al generar datos del gráfico" });
  }
});

module.exports = router;
