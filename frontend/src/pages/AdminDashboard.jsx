import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import "../styles/AdminDashboard.css";

Chart.defaults.color = "#ffffff";
Chart.defaults.borderColor = "rgba(255, 255, 255, 0.1)";

const AdminDashboard = () => {
  // ==========================================
  // ESTADOS ORIGINALES
  // ==========================================
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [medicosAprobados, setMedicosAprobados] = useState([]);
  const [pacientesAprobados, setPacientesAprobados] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [tipoEdicion, setTipoEdicion] = useState(""); // "paciente" o "medico"

  // ==========================================
  // ESTADOS NUEVOS (HU-208 y HU-209)
  // ==========================================
  const [vistaActiva, setVistaActiva] = useState("usuarios"); // 'usuarios', 'denuncias', 'graficos'
  const [denuncias, setDenuncias] = useState([]);
  const [promedios, setPromedios] = useState({ medicos: [], pacientes: [] });
  const [reporteMedicos, setReporteMedicos] = useState([]);
  const [reporteEspecialidades, setReporteEspecialidades] = useState([]);
  const [graficoHorarios, setGraficoHorarios] = useState([]);
  const [graficoCancelaciones, setGraficoCancelaciones] = useState([]);

  const navigate = useNavigate();

  // ==========================================
  // FUNCIONES DE FETCH (Consolidadas)
  // ==========================================
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin-login");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Se obtienen todos los datos en paralelo para mayor rapidez
      const [
        resMedPend,
        resPacPend,
        resMedApro,
        resPacApro,
        resTopMed,
        resTopEsp,
        resDenuncias,
        resPromedios,
        resHorarios,
        resCancelaciones,
      ] = await Promise.all([
        fetch(
          "http://localhost:5000/api/auth/admin/medicos-pendientes",
          config,
        ),
        fetch(
          "http://localhost:5000/api/auth/admin/pacientes-pendientes",
          config,
        ),
        fetch("http://localhost:5000/api/auth/admin/medicos-aprobados", config),
        fetch(
          "http://localhost:5000/api/auth/admin/pacientes-aprobados",
          config,
        ),
        fetch("http://localhost:5000/api/auth/admin/medicos-top", config),
        fetch("http://localhost:5000/api/auth/admin/especialidades", config),
        fetch("http://localhost:5000/api/auth/admin/denuncias", config),
        fetch(
          "http://localhost:5000/api/auth/admin/calificaciones-promedios",
          config,
        ),
        fetch("http://localhost:5000/api/auth/admin/grafico-horarios", config),
        fetch(
          "http://localhost:5000/api/auth/admin/grafico-cancelaciones",
          config,
        ),
      ]);

      if (resMedPend.ok) setMedicos(await resMedPend.json());
      if (resPacPend.ok) setPacientes(await resPacPend.json());
      if (resMedApro.ok) setMedicosAprobados(await resMedApro.json());
      if (resPacApro.ok) setPacientesAprobados(await resPacApro.json());

      if (resTopMed.ok) setReporteMedicos(await resTopMed.json());
      if (resTopEsp.ok) setReporteEspecialidades(await resTopEsp.json());

      if (resDenuncias.ok) setDenuncias(await resDenuncias.json());
      if (resPromedios.ok) setPromedios(await resPromedios.json());
      if (resHorarios.ok) setGraficoHorarios(await resHorarios.json());
      if (resCancelaciones.ok)
        setGraficoCancelaciones(await resCancelaciones.json());
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // ==========================================
  // LÓGICA DE GRÁFICOS (Originales + Nuevos)
  // ==========================================
  useEffect(() => {
    // Solo renderizar gráficos si estamos en la pestaña correcta
    if (vistaActiva !== "graficos") return;

    // Destruir instancias previas para evitar error de "Canvas is already in use"
    const idsGraficos = [
      "graficoMedicos",
      "graficoEspecialidades",
      "graficoHorarios",
      "graficoCancelaciones",
    ];
    idsGraficos.forEach((id) => {
      const chartExistente = Chart.getChart(id);
      if (chartExistente) chartExistente.destroy();
    });

    if (reporteMedicos.length > 0) {
      new Chart(document.getElementById("graficoMedicos"), {
        type: "bar",
        data: {
          labels: reporteMedicos.map((m) => m.nombre),
          datasets: [
            {
              label: "Citas atendidas",
              data: reporteMedicos.map((m) => m.total_citas),
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    if (reporteEspecialidades.length > 0) {
      new Chart(document.getElementById("graficoEspecialidades"), {
        type: "pie",
        data: {
          labels: reporteEspecialidades.map((e) => e.especialidad),
          datasets: [
            {
              label: "Especialidades solicitadas",
              data: reporteEspecialidades.map((e) => e.total),
              backgroundColor: [
                "#36A2EB",
                "#FF6384",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
              ],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    if (graficoHorarios.length > 0) {
      new Chart(document.getElementById("graficoHorarios"), {
        type: "doughnut",
        data: {
          labels: graficoHorarios.map((h) => h.franja_horaria),
          datasets: [
            {
              data: graficoHorarios.map((h) => h.total_citas),
              backgroundColor: ["#ff9f40", "#ffcd56", "#4bc0c0"],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    if (graficoCancelaciones.length > 0) {
      new Chart(document.getElementById("graficoCancelaciones"), {
        type: "bar",
        data: {
          labels: graficoCancelaciones.map((c) => c.especialidad),
          datasets: [
            {
              label: "Citas Canceladas",
              data: graficoCancelaciones.map((c) => c.total_canceladas),
              backgroundColor: "rgba(255, 99, 132, 0.6)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }, [
    vistaActiva,
    reporteMedicos,
    reporteEspecialidades,
    graficoHorarios,
    graficoCancelaciones,
  ]);

  // ==========================================
  // FUNCIONES AUXILIARES Y MANEJADORES
  // ==========================================
  const getPdfUrl = (rutaPdf) => {
    if (!rutaPdf) return null;
    const nombreArchivo = rutaPdf.split("\\").pop().split("/").pop();
    return `http://localhost:5000/uploads/${nombreArchivo}`;
  };

  const getImageUrl = (rutaFoto) => {
    if (!rutaFoto) return "https://via.placeholder.com/50";
    const nombreArchivo = rutaFoto.split("\\").pop().split("/").pop();
    return `http://localhost:5000/uploads/${nombreArchivo}`;
  };

  const handleDarDeBaja = async (tipo, id) => {
    if (
      !window.confirm(
        `¿Estás súper seguro de dar de BAJA a este ${tipo}? Ya no podrá iniciar sesión.`,
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/auth/admin/baja-${tipo}/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setMensaje(
          `⚠️ ${tipo === "medico" ? "Médico" : "Paciente"} dado de baja`,
        );
        fetchData(); // Recargar datos
      }
    } catch (error) {
      console.error("Error al dar de baja:", error);
    }
  };

  const handleAccion = async (tipo, accion, id) => {
    if (
      !window.confirm(
        `¿Estás seguro de ${accion.toUpperCase()} a este ${tipo}?`,
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/auth/admin/${accion}-${tipo}/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setMensaje(
          ` ${tipo === "medico" ? "Médico" : "Paciente"} ${accion}do exitosamente`,
        );
        fetchData(); // Recargar datos
      }
    } catch (error) {
      console.error(`Error al ${accion}:`, error);
    }
  };

  const guardarCambios = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        tipoEdicion === "paciente"
          ? `http://localhost:5000/api/auth/admin/actualizar-paciente/${seleccionado.id}`
          : `http://localhost:5000/api/auth/admin/actualizar-medico/${seleccionado.id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(seleccionado),
      });

      if (response.ok) {
        setMensaje("Datos actualizados correctamente");
        setSeleccionado(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  // HU-208: Rechazar Denuncia
  const handleRechazarDenuncia = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de descartar/rechazar esta denuncia? Se eliminará del sistema.",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/auth/admin/denuncias/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setMensaje("Denuncia rechazada y eliminada.");
        fetchData();
      }
    } catch (error) {
      console.error("Error eliminando denuncia:", error);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>🛡️ Panel de Administración - SaludPlus</h2>
        <button
          className="btn-logout"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/admin-login");
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      {mensaje && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#d4edda",
            color: "#155724",
            marginBottom: "20px",
            borderRadius: "5px",
          }}
        >
          {mensaje}
        </div>
      )}

      {/* MENÚ DE PESTAÑAS */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px",
          borderBottom: "2px solid #ccc",
          paddingBottom: "10px",
        }}
      >
        <button
          onClick={() => setVistaActiva("usuarios")}
          style={{
            padding: "10px",
            backgroundColor:
              vistaActiva === "usuarios" ? "#0056b3" : "transparent",
            color: vistaActiva === "usuarios" ? "white" : "#ccc",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          👥 Gestión de Usuarios
        </button>
        <button
          onClick={() => setVistaActiva("denuncias")}
          style={{
            padding: "10px",
            backgroundColor:
              vistaActiva === "denuncias" ? "#dc3545" : "transparent",
            color: vistaActiva === "denuncias" ? "white" : "#ccc",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ⚠️ Denuncias y Calificaciones
        </button>
        <button
          onClick={() => setVistaActiva("graficos")}
          style={{
            padding: "10px",
            backgroundColor:
              vistaActiva === "graficos" ? "#28a745" : "transparent",
            color: vistaActiva === "graficos" ? "white" : "#ccc",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📊 Reportes Analíticos
        </button>
      </div>

      {/* ======================================================= */}
      {/* VISTA 1: GESTIÓN DE USUARIOS (Tú código ORIGINAL)         */}
      {/* ======================================================= */}
      {vistaActiva === "usuarios" && (
        <>
          {/* SECCIÓN DE MÉDICOS PENDIENTES */}
          <h3>📋 Médicos Pendientes de Aprobación</h3>
          {medicos.length === 0 ? (
            <p>No hay médicos pendientes.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nombre Completo</th>
                  <th>DPI</th>
                  <th>Género</th>
                  <th>Colegiado</th>
                  <th>Especialidad</th>
                  <th>Correo</th>
                  <th>Acciones</th>
                  <th>CV</th>
                </tr>
              </thead>
              <tbody>
                {medicos.map((medico) => (
                  <tr key={medico.id}>
                    <td>
                      <img
                        src={getImageUrl(medico.foto)}
                        alt="Perfil"
                        className="foto-perfil"
                      />
                    </td>
                    <td>
                      {medico.nombre} {medico.apellido}
                    </td>
                    <td>{medico.dpi}</td>
                    <td>{medico.genero}</td>
                    <td>{medico.numero_colegiado}</td>
                    <td>{medico.especialidad}</td>
                    <td>{medico.correo}</td>
                    <td>
                      <button
                        className="btn-aprobar"
                        onClick={() =>
                          handleAccion("medico", "aprobar", medico.id)
                        }
                      >
                        Aceptar
                      </button>
                      <button
                        className="btn-rechazar"
                        onClick={() =>
                          handleAccion("medico", "rechazar", medico.id)
                        }
                      >
                        Rechazar
                      </button>
                    </td>
                    <td>
                      {medico.cv_pdf ? (
                        <iframe
                          style={{
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                          }}
                          src={getPdfUrl(medico.cv_pdf)}
                          width="150"
                          height="200"
                          title="CV"
                        />
                      ) : (
                        <span>No disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* SECCIÓN DE PACIENTES PENDIENTES */}
          <h3>📋 Pacientes Pendientes de Aprobación</h3>
          {pacientes.length === 0 ? (
            <p>No hay pacientes pendientes.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nombre Completo</th>
                  <th>DPI</th>
                  <th>Género</th>
                  <th>Correo</th>
                  <th>Acciones</th>
                  <th>DPI PDF</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((paciente) => (
                  <tr key={paciente.id}>
                    <td>
                      <img
                        src={getImageUrl(paciente.foto)}
                        alt="Perfil"
                        className="foto-perfil"
                      />
                    </td>
                    <td>
                      {paciente.nombre} {paciente.apellido}
                    </td>
                    <td>{paciente.dpi}</td>
                    <td>{paciente.genero}</td>
                    <td>{paciente.correo}</td>
                    <td>
                      <button
                        className="btn-aprobar"
                        onClick={() =>
                          handleAccion("paciente", "aprobar", paciente.id)
                        }
                      >
                        Aceptar
                      </button>
                      <button
                        className="btn-rechazar"
                        onClick={() =>
                          handleAccion("paciente", "rechazar", paciente.id)
                        }
                      >
                        Rechazar
                      </button>
                    </td>
                    <td>
                      {paciente.dpi_pdf ? (
                        <iframe
                          style={{
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                          }}
                          src={getPdfUrl(paciente.dpi_pdf)}
                          width="150"
                          height="200"
                          title="DPI"
                        />
                      ) : (
                        <span>No disponible</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PANEL DE EDICIÓN */}
          {seleccionado && (
            <div className="edit-panel">
              <h3>✏️ Editando {tipoEdicion}</h3>
              <input
                value={seleccionado.nombre || ""}
                onChange={(e) =>
                  setSeleccionado({ ...seleccionado, nombre: e.target.value })
                }
                placeholder="Nombre"
              />
              <input
                value={seleccionado.apellido || ""}
                onChange={(e) =>
                  setSeleccionado({ ...seleccionado, apellido: e.target.value })
                }
                placeholder="Apellido"
              />
              <input
                value={seleccionado.dpi || ""}
                onChange={(e) =>
                  setSeleccionado({ ...seleccionado, dpi: e.target.value })
                }
                placeholder="DPI"
              />
              <input
                value={seleccionado.telefono || ""}
                onChange={(e) =>
                  setSeleccionado({ ...seleccionado, telefono: e.target.value })
                }
                placeholder="Teléfono"
              />
              <input
                value={seleccionado.direccion || ""}
                onChange={(e) =>
                  setSeleccionado({
                    ...seleccionado,
                    direccion: e.target.value,
                  })
                }
                placeholder="Dirección"
              />

              <select
                value={seleccionado.genero || ""}
                onChange={(e) =>
                  setSeleccionado({ ...seleccionado, genero: e.target.value })
                }
              >
                <option value="">Seleccione género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>

              {tipoEdicion === "paciente" && (
                <input
                  type="date"
                  value={seleccionado.fecha_nacimiento || ""}
                  onChange={(e) =>
                    setSeleccionado({
                      ...seleccionado,
                      fecha_nacimiento: e.target.value,
                    })
                  }
                />
              )}

              {tipoEdicion === "medico" && (
                <>
                  <input
                    value={seleccionado.especialidad || ""}
                    onChange={(e) =>
                      setSeleccionado({
                        ...seleccionado,
                        especialidad: e.target.value,
                      })
                    }
                    placeholder="Especialidad"
                  />
                  <input
                    value={seleccionado.numero_colegiado || ""}
                    onChange={(e) =>
                      setSeleccionado({
                        ...seleccionado,
                        numero_colegiado: e.target.value,
                      })
                    }
                    placeholder="Número de colegiado"
                  />
                  <input
                    value={seleccionado.direccion_clinica || ""}
                    onChange={(e) =>
                      setSeleccionado({
                        ...seleccionado,
                        direccion_clinica: e.target.value,
                      })
                    }
                    placeholder="Dirección clínica"
                  />
                </>
              )}

              <input value={seleccionado.correo || ""} disabled />

              <div style={{ marginTop: "10px" }}>
                <button onClick={guardarCambios}>Guardar</button>
                <button onClick={() => setSeleccionado(null)}>Cancelar</button>
              </div>
            </div>
          )}

          <hr style={{ margin: "40px 0", border: "1px solid #ccc" }} />
          <h2 style={{ color: "#0056b3" }}>
            🟢 Usuarios Activos en el Sistema
          </h2>

          {/* MÉDICOS ACTIVOS */}
          <h3>Médicos Activos</h3>
          {medicosAprobados.length === 0 ? (
            <p>No hay médicos activos.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nombre Completo</th>
                  <th>DPI</th>
                  <th>Género</th>
                  <th>Colegiado</th>
                  <th>Especialidad</th>
                  <th>Correo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {medicosAprobados.map((medico) => (
                  <tr key={medico.id}>
                    <td>
                      <img
                        src={getImageUrl(medico.foto)}
                        alt="Perfil"
                        className="foto-perfil"
                      />
                    </td>
                    <td>
                      {medico.nombre} {medico.apellido}
                    </td>
                    <td>{medico.dpi}</td>
                    <td>{medico.genero}</td>
                    <td>{medico.numero_colegiado}</td>
                    <td>{medico.especialidad}</td>
                    <td>{medico.correo}</td>
                    <td>
                      <button
                        className="btn-rechazar"
                        onClick={() => handleDarDeBaja("medico", medico.id)}
                      >
                        Dar de Baja
                      </button>
                      <button
                        className="btn-aprobar"
                        onClick={() => {
                          setSeleccionado(medico);
                          setTipoEdicion("medico");
                        }}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PACIENTES ACTIVOS */}
          <h3>Pacientes Activos</h3>
          {pacientesAprobados.length === 0 ? (
            <p>No hay pacientes activos.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nombre Completo</th>
                  <th>DPI</th>
                  <th>Género</th>
                  <th>Correo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesAprobados.map((paciente) => (
                  <tr key={paciente.id}>
                    <td>
                      <img
                        src={getImageUrl(paciente.foto)}
                        alt="Perfil"
                        className="foto-perfil"
                      />
                    </td>
                    <td>
                      {paciente.nombre} {paciente.apellido}
                    </td>
                    <td>{paciente.dpi}</td>
                    <td>{paciente.genero}</td>
                    <td>{paciente.correo}</td>
                    <td>
                      <button
                        className="btn-rechazar"
                        onClick={() => handleDarDeBaja("paciente", paciente.id)}
                      >
                        Dar de Baja
                      </button>
                      <button
                        className="btn-aprobar"
                        onClick={() => {
                          setSeleccionado(paciente);
                          setTipoEdicion("paciente");
                        }}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ======================================================= */}
      {/* VISTA 2: DENUNCIAS Y CALIFICACIONES (HU-208)              */}
      {/* ======================================================= */}
      {vistaActiva === "denuncias" && (
        <>
          <h2 style={{ color: "#dc3545" }}>⚠️ Bandeja de Denuncias</h2>
          {denuncias.length === 0 ? (
            <p>No hay reportes ni denuncias activas.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {denuncias.map((denuncia) => (
                <div
                  key={denuncia.id}
                  className="edit-panel"
                  style={{ display: "block" }}
                >
                  <h4 style={{ color: "#ff6b6b", margin: "0 0 10px 0" }}>
                    Categoría: {denuncia.categoria}
                  </h4>
                  <p>
                    <strong>Por:</strong>{" "}
                    {denuncia.reportador_rol === "paciente"
                      ? `Paciente: ${denuncia.paciente_nombre}`
                      : `Médico: ${denuncia.medico_nombre}`}
                  </p>
                  <p>
                    <strong>Acusado:</strong>{" "}
                    {denuncia.reportador_rol === "paciente"
                      ? `Médico: ${denuncia.medico_nombre}`
                      : `Paciente: ${denuncia.paciente_nombre}`}
                  </p>
                  <p>
                    <strong>Motivo:</strong> "{denuncia.explicacion}"
                  </p>
                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "15px" }}
                  >
                    <button
                      onClick={() => handleRechazarDenuncia(denuncia.id)}
                      style={{ flex: 1, backgroundColor: "#6c757d" }}
                    >
                      Descartar
                    </button>
                    <button
                      onClick={() =>
                        handleDarDeBaja(
                          denuncia.reportador_rol === "paciente"
                            ? "medico"
                            : "paciente",
                          denuncia.reportador_rol === "paciente"
                            ? denuncia.medico_id
                            : denuncia.paciente_id,
                        )
                      }
                      style={{ flex: 1 }}
                    >
                      Dar de Baja al Acusado
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr style={{ margin: "40px 0", border: "1px solid #ccc" }} />

          <h2 style={{ color: "#ffc107" }}>⭐ Promedio de Calificaciones</h2>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 45%" }}>
              <h3>Médicos</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Especialidad</th>
                    <th>Promedio</th>
                    <th>Total Evaluaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {promedios.medicos.length === 0 ? (
                    <tr>
                      <td colSpan="4">Sin datos</td>
                    </tr>
                  ) : (
                    promedios.medicos.map((m) => (
                      <tr key={m.id}>
                        <td>
                          {m.nombre} {m.apellido}
                        </td>
                        <td>{m.especialidad}</td>
                        <td style={{ color: "#ffc107", fontWeight: "bold" }}>
                          ⭐ {m.promedio}
                        </td>
                        <td>{m.total_evaluaciones}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ flex: "1 1 45%" }}>
              <h3>Pacientes</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Promedio</th>
                    <th>Total Evaluaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {promedios.pacientes.length === 0 ? (
                    <tr>
                      <td colSpan="3">Sin datos</td>
                    </tr>
                  ) : (
                    promedios.pacientes.map((p) => (
                      <tr key={p.id}>
                        <td>
                          {p.nombre} {p.apellido}
                        </td>
                        <td style={{ color: "#ffc107", fontWeight: "bold" }}>
                          ⭐ {p.promedio}
                        </td>
                        <td>{p.total_evaluaciones}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================================================= */}
      {/* VISTA 3: GRÁFICOS ANALÍTICOS (HU-209)                     */}
      {/* ======================================================= */}
      {vistaActiva === "graficos" && (
        <>
          <h2 style={{ color: "#28a745" }}>
            📊 Reportes Analíticos del Sistema
          </h2>
          <div className="reportes-container">
            {/* Gráficos Originales */}
            <div className="reporte">
              <h3>Médicos con más citas atendidas</h3>
              <canvas id="graficoMedicos"></canvas>
            </div>
            <div className="reporte">
              <h3>Especialidades más solicitadas</h3>
              <canvas id="graficoEspecialidades"></canvas>
            </div>

            {/* Nuevos Gráficos HU-209 */}
            <div className="reporte">
              <h3>Demanda por Franja Horaria</h3>
              <canvas id="graficoHorarios"></canvas>
            </div>
            <div className="reporte">
              <h3>Cancelaciones por Especialidad</h3>
              <canvas id="graficoCancelaciones"></canvas>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
