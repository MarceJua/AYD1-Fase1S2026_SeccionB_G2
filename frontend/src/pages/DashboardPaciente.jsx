import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

const DashboardPaciente = () => {
  const [vista, setVista] = useState("medicos");
  const [medicos, setMedicos] = useState([]);
  const [especialidadFiltro, setEspecialidadFiltro] = useState("");
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({ fecha: "", hora: "", motivo: "" });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const [medicoHorario, setMedicoHorario] = useState(null);
  const [horarioData, setHorarioData] = useState(null);
  const [cargandoHorario, setCargandoHorario] = useState(false);
  const [horarioMensaje, setHorarioMensaje] = useState("");

  const [misCitas, setMisCitas] = useState([]);
  const [historialCitas, setHistorialCitas] = useState([]);
  const [cargandoCitas, setCargandoCitas] = useState(false);

  // ESTADOS PARA HU-205 (Calificar Médico)
  const [modalCalificarVisible, setModalCalificarVisible] = useState(false);
  const [citaACalificar, setCitaACalificar] = useState(null);
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState("");
  const [calificacionMensaje, setCalificacionMensaje] = useState({ texto: "", tipo: "" });

  const abrirModalCalificar = (cita) => {
    setCitaACalificar(cita);
    setEstrellas(5);
    setComentario("");
    setCalificacionMensaje({ texto: "", tipo: "" });
    setModalCalificarVisible(true);
  };

  const handleCalificarMedico = async (e) => {
    e.preventDefault();
    setCalificacionMensaje({ texto: "", tipo: "" });
    try {
      await axios.post(`${apiUrl}/paciente/calificar-medico`, {
        cita_id: citaACalificar.id,
        estrellas: estrellas,
        comentario: comentario,
      });
      setCalificacionMensaje({ texto: "¡Médico calificado exitosamente!", tipo: "success" });
      setTimeout(() => {
        setModalCalificarVisible(false);
        setCitaACalificar(null);
      }, 2000);
    } catch (error) {
      setCalificacionMensaje({
        texto: error.response?.data?.error || "Error al calificar al médico",
        tipo: "error",
      });
    }
  };

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiBase = apiUrl.replace(/\/api\/?$/, "");

  const capitalizar = (str = "") => str.charAt(0).toUpperCase() + str.slice(1);

  const formatearDias = (dias) => {
    if (!dias || dias.length === 0) return "Sin días configurados";
    return dias.map(capitalizar).join(", ");
  };

  const formatearFecha = (fechaStr) => {
    const date = new Date(fechaStr);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatearHora = (horaStr) => (horaStr ? horaStr.slice(0, 5) : "");

  const imprimirReceta = (cita) => {
    const ventana = window.open("", "_blank");
    const fechaEmision = new Date().toLocaleDateString("es-ES");
    const medicamentosHTML =
      Array.isArray(cita.medicamentos) && cita.medicamentos.length > 0
        ? cita.medicamentos
            .map(
              (m) => `<tr>
                <td>${m.nombre}</td>
                <td>${m.cantidad}</td>
                <td>${m.tiempo}</td>
                <td>${m.descripcion_dosis}</td>
              </tr>`,
            )
            .join("")
        : '<tr><td colspan="4" style="text-align:center;color:#888;">Sin medicamentos registrados</td></tr>';

    ventana.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Receta Médica - SaludPlus</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #0056b3; margin: 0 0 5px; font-size: 30px; }
    .header p { margin: 4px 0; color: #555; font-size: 14px; }
    .section { margin-bottom: 25px; }
    .section h3 { color: #0056b3; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 12px; }
    .section p { margin: 5px 0; font-size: 14px; }
    .diagnostico-box { background: #f0f7ff; border-left: 4px solid #0056b3; padding: 12px 16px; border-radius: 4px; font-size: 15px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background-color: #0056b3; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
    td { padding: 9px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
    tr:nth-child(even) td { background-color: #f8f9fa; }
    .footer { margin-top: 60px; text-align: right; border-top: 2px solid #ccc; padding-top: 16px; }
    .footer p { margin: 3px 0; font-size: 14px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Clínica SaludPlus</h1>
    <p>Fecha de emisión: ${fechaEmision}</p>
    <p>Teléfono de contacto: ${cita.medico_telefono || "N/A"}</p>
  </div>
  <div class="section">
    <h3>Información del Médico</h3>
    <p><strong>Médico:</strong> Dr/Dra. ${cita.medico_nombre} ${cita.medico_apellido}</p>
    <p><strong>Especialidad:</strong> ${cita.especialidad}</p>
    <p><strong>N° Colegiado:</strong> ${cita.numero_colegiado || "N/A"}</p>
  </div>
  <div class="section">
    <h3>Diagnóstico</h3>
    <div class="diagnostico-box">${cita.diagnostico || "Sin diagnóstico registrado"}</div>
  </div>
  <div class="section">
    <h3>Medicamentos Recetados</h3>
    <table>
      <thead>
        <tr>
          <th>Medicamento</th><th>Cantidad</th><th>Tiempo</th><th>Descripción de la Dosis</th>
        </tr>
      </thead>
      <tbody>${medicamentosHTML}</tbody>
    </table>
  </div>
  <div class="footer">
    <p><strong>Dr/Dra. ${cita.medico_nombre} ${cita.medico_apellido}</strong></p>
    <p>${cita.especialidad}</p>
    <p>Colegiado N°: ${cita.numero_colegiado || "N/A"}</p>
  </div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`);
    ventana.document.close();
  };

  const construirFotoMedico = (foto) => {
    if (!foto) return null;
    if (foto.startsWith("http://") || foto.startsWith("https://")) return foto;
    const nombreArchivo = foto.split(/[/\\]/).pop();
    return `${apiBase}/uploads/${nombreArchivo}`;
  };

  useEffect(() => {
    if (!usuario?.id) {
      navigate("/login");
      return;
    }

    const fetchMedicos = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/paciente/medicos`,
          { params: { paciente_id: usuario.id } },
        );
        setMedicos(response.data);
      } catch (error) {
        console.error("Error cargando médicos", error);
      }
    };

    fetchMedicos();
  }, [apiUrl, navigate, usuario?.id]);

  useEffect(() => {
    if (!usuario?.id || (vista !== "citas" && vista !== "historial")) return;

    const fetchCitasOHistorial = async () => {
      setCargandoCitas(true);
      try {
        if (vista === "citas") {
          const resActivas = await axios.get(
            `${apiUrl}/paciente/mis-citas/${usuario.id}`,
          );
          setMisCitas(resActivas.data.citas);
          return;
        }

        if (vista === "historial") {
          const resHistorial = await axios.get(
            `${apiUrl}/paciente/historial-citas/${usuario.id}`,
          );
          setHistorialCitas(resHistorial.data.historial);
        }
      } catch (error) {
        console.error("Error cargando información de citas", error);
      } finally {
        setCargandoCitas(false);
      }
    };

    fetchCitasOHistorial();
  }, [apiUrl, usuario?.id, vista]);

  const recargarMedicos = async () => {
    if (!usuario?.id) return;
    const response = await axios.get(`${apiUrl}/paciente/medicos`, {
      params: { paciente_id: usuario.id },
    });
    setMedicos(response.data);
  };

  const handleProgramarCita = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    try {
      const payload = {
        medico_id: medicoSeleccionado.id,
        paciente_id: usuario.id,
        ...formData,
      };

      await axios.post(`${apiUrl}/paciente/programar-cita`, payload);

      await recargarMedicos();
      setMensaje({ texto: "Cita programada con éxito.", tipo: "success" });
      setFormData({ fecha: "", hora: "", motivo: "" });

      setTimeout(() => {
        setMedicoSeleccionado(null);
        setMensaje({ texto: "", tipo: "" });
      }, 1500);
    } catch (error) {
      setMensaje({
        texto: error.response?.data?.error || "Error al programar la cita",
        tipo: "error",
      });
    }
  };

  const handleCancelarCita = async (citaId) => {
    if (
      !window.confirm(
        "¿Estás seguro de cancelar esta cita? Recuerda que debes hacerlo con al menos 24 horas de anticipación.",
      )
    ) {
      return;
    }

    try {
      await axios.put(`${apiUrl}/paciente/cita/${citaId}/cancelar`);
      alert("✅ Cita cancelada exitosamente.");

      const response = await axios.get(
        `${apiUrl}/paciente/mis-citas/${usuario.id}`,
      );
      setMisCitas(response.data.citas);
      await recargarMedicos();
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.error || "Error al cancelar la cita"}`);
    }
  };

  const handleVerHorario = async (medico) => {
    setMedicoHorario(medico);
    setHorarioData(null);
    setHorarioMensaje("");
    setCargandoHorario(true);

    try {
      const res = await axios.get(`${apiUrl}/paciente/medicos/${medico.id}/horario`);
      setHorarioData(res.data);
      if (!res.data.horario) {
        setHorarioMensaje("Este médico aún no ha configurado su horario de atención.");
      }
    } catch {
      setHorarioMensaje("Error al cargar el horario del médico.");
    } finally {
      setCargandoHorario(false);
    }
  };

  const cerrarModalHorario = () => {
    setMedicoHorario(null);
    setHorarioData(null);
    setHorarioMensaje("");
  };

  const medicosFiltrados = medicos.filter((medico) =>
    medico.especialidad
      .toLowerCase()
      .includes(especialidadFiltro.toLowerCase()),
  );

  const tieneHorario = horarioData && horarioData.horario;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-top">
          <h1>Portal del Paciente</h1>
          <div className="header-buttons">
            <button className="btn-perfil" onClick={() => navigate("/perfil")}>
              Modificar Datos
            </button>
            <button className="btn-logout" onClick={() => navigate("/login")}>
              Cerrar Sesion
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${vista === "medicos" ? "tab-btn-activo" : ""}`}
          onClick={() => setVista("medicos")}
        >
          Medicos
        </button>
        <button
          className={`tab-btn ${vista === "citas" ? "tab-btn-activo" : ""}`}
          onClick={() => setVista("citas")}
        >
          Mis Citas
        </button>
        <button
          className={`tab-btn ${vista === "historial" ? "tab-btn-activo" : ""}`}
          onClick={() => setVista("historial")}
        >
          Historial Médico
        </button>
      </div>

      {vista === "medicos" && (
        <>
          <section className="search-section">
            <input
              className="search-input"
              type="text"
              placeholder="Filtrar por especialidad..."
              onChange={(e) => setEspecialidadFiltro(e.target.value)}
            />
          </section>

          <section className="medicos-grid">
            {medicosFiltrados.length === 0 && (
              <p className="no-results">
                No hay médicos disponibles para una nueva cita en este momento.
              </p>
            )}

            {medicosFiltrados.map((medico) => (
              <div key={medico.id} className="medico-card">
                {construirFotoMedico(medico.foto) ? (
                  <img
                    src={construirFotoMedico(medico.foto)}
                    alt={`Foto de ${medico.nombre} ${medico.apellido || ""}`}
                    className="medico-foto"
                  />
                ) : (
                  <div className="medico-foto" aria-label="Foto no disponible" />
                )}

                <h3>
                  Dr. {medico.nombre} {medico.apellido}
                </h3>
                <p className="especialidad">{medico.especialidad}</p>
                <p className="direccion">{medico.direccion_clinica}</p>

                <div className="card-buttons">
                  <button
                    onClick={() => handleVerHorario(medico)}
                    className="btn-horario"
                  >
                    Ver Horario
                  </button>
                  <button
                    onClick={() => setMedicoSeleccionado(medico)}
                    className="btn-ver-horarios"
                  >
                    Programar Cita
                  </button>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {vista === "citas" && (
        <section className="mis-citas-section">
          <h2 className="mis-citas-titulo">Mis citas pendientes de atención</h2>

          {cargandoCitas && <p className="citas-cargando">Cargando citas...</p>}
          {!cargandoCitas && misCitas.length === 0 && (
            <p className="citas-vacio">
              No tienes citas activas en este momento.
            </p>
          )}

          {!cargandoCitas && misCitas.length > 0 && (
            <div className="citas-lista">
              {misCitas.map((cita) => (
                <div key={cita.id} className="cita-card">
                  <div className="cita-fila">
                    <span className="cita-etiqueta">Medico:</span>
                    <span className="cita-valor">
                      {cita.medico_nombre} {cita.medico_apellido}
                    </span>
                  </div>
                  <div className="cita-fila">
                    <span className="cita-etiqueta">Fecha:</span>
                    <span className="cita-valor">
                      {formatearFecha(cita.fecha)}
                    </span>
                  </div>
                  <div className="cita-fila">
                    <span className="cita-etiqueta">Hora:</span>
                    <span className="cita-valor">
                      {formatearHora(cita.hora)}
                    </span>
                  </div>
                  <div className="cita-fila">
                    <span className="cita-etiqueta">Clinica:</span>
                    <span className="cita-valor">{cita.direccion_clinica}</span>
                  </div>
                  <div className="cita-fila cita-fila-motivo">
                    <span className="cita-etiqueta">Motivo:</span>
                    <span className="cita-valor">{cita.motivo}</span>
                  </div>

                  {/* BOTÓN DE CANCELAR CITA */}
                  <button
                    onClick={() => handleCancelarCita(cita.id)}
                    style={{
                      marginTop: "15px",
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    ❌ Cancelar Cita
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {vista === "historial" && (
        <section className="mis-citas-section">
          <h2 className="mis-citas-titulo">Mi Historial de Citas</h2>

          {cargandoCitas && (
            <p className="citas-cargando">Cargando historial...</p>
          )}
          {!cargandoCitas && historialCitas.length === 0 && (
            <p className="citas-vacio">
              No tienes citas registradas en tu historial.
            </p>
          )}

          {!cargandoCitas && historialCitas.length > 0 && (
            <div className="citas-lista">
              {historialCitas.map((cita) => (
                <div
                  key={cita.id}
                  className="cita-card"
                  style={{
                    borderLeft: `5px solid ${cita.estado_mostrable === "Atendido" ? "#28a745" : "#dc3545"}`,
                  }}
                >
                  <div className="cita-fila">
                    <span className="cita-etiqueta">Medico:</span>
                    <span className="cita-valor">
                      {cita.medico_nombre} {cita.medico_apellido}
                    </span>
                  </div>
                  <div className="cita-fila">
                    <span className="cita-etiqueta">Fecha:</span>
                    <span className="cita-valor">
                      {formatearFecha(cita.fecha)} a las{" "}
                      {formatearHora(cita.hora)}
                    </span>
                  </div>
                  <div className="cita-fila">
                    <span className="cita-etiqueta">Clínica:</span>
                    <span className="cita-valor">{cita.direccion_clinica}</span>
                  </div>
                  <div className="cita-fila">
                    <span className="cita-etiqueta">Estado:</span>
                    <span
                      className="cita-valor"
                      style={{
                        color:
                          cita.estado_mostrable === "Atendido" ? "#28a745" : "#dc3545",
                        fontWeight: "bold",
                      }}
                    >
                      {cita.estado_mostrable || cita.estado}
                    </span>
                  </div>
                  <div className="cita-fila cita-fila-motivo">
                    <span className="cita-etiqueta">Motivo Inicial:</span>
                    <span className="cita-valor">{cita.motivo}</span>
                  </div>

                  {cita.estado_mostrable === "Atendido" && (
                    <div style={{ marginTop: "10px" }}>
                      {/* Diagnóstico */}
                      <div
                        style={{
                          padding: "10px",
                          backgroundColor: "#d4edda",
                          borderRadius: "5px",
                          fontSize: "14px",
                          color: "#155724",
                          marginBottom: "8px",
                        }}
                      >
                        <strong>Diagnóstico:</strong>{" "}
                        {cita.diagnostico || cita.tratamiento || "Sin diagnóstico registrado."}
                      </div>

                      {/* Tabla de medicamentos */}
                      {Array.isArray(cita.medicamentos) && cita.medicamentos.length > 0 && (
                        <div
                          style={{
                            padding: "10px",
                            backgroundColor: "#e8f4fd",
                            borderRadius: "5px",
                            fontSize: "13px",
                            color: "#0c5460",
                            marginBottom: "8px",
                            overflowX: "auto",
                          }}
                        >
                          <strong>Medicamentos recetados:</strong>
                          <table style={{ width: "100%", marginTop: "8px", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ backgroundColor: "#0056b3", color: "white" }}>
                                <th style={{ padding: "6px 8px", textAlign: "left", fontSize: "12px" }}>Medicamento</th>
                                <th style={{ padding: "6px 8px", textAlign: "left", fontSize: "12px" }}>Cantidad</th>
                                <th style={{ padding: "6px 8px", textAlign: "left", fontSize: "12px" }}>Tiempo</th>
                                <th style={{ padding: "6px 8px", textAlign: "left", fontSize: "12px" }}>Dosis</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cita.medicamentos.map((med, i) => (
                                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f8f9fa" : "white" }}>
                                  <td style={{ padding: "5px 8px", fontSize: "12px" }}>{med.nombre}</td>
                                  <td style={{ padding: "5px 8px", fontSize: "12px" }}>{med.cantidad}</td>
                                  <td style={{ padding: "5px 8px", fontSize: "12px" }}>{med.tiempo}</td>
                                  <td style={{ padding: "5px 8px", fontSize: "12px" }}>{med.descripcion_dosis}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Botón imprimir receta */}
                      <button
                        onClick={() => imprimirReceta(cita)}
                        style={{
                          width: "100%",
                          padding: "9px",
                          backgroundColor: "#0056b3",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "13px",
                        }}
                      >
                        Imprimir Receta Médica
                      </button>
                      {/* NUEVO BOTÓN: Calificar Médico (HU-205) */}
                      <button
                        onClick={() => abrirModalCalificar(cita)}
                        style={{
                          width: "100%",
                          padding: "9px",
                          backgroundColor: "#ffc107",
                          color: "#000",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "13px",
                          marginTop: "10px",
                        }}
                      >
                        Calificar Atención Médica
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {medicoHorario && (
        <div className="modal-overlay">
          <div className="modal-content modal-horario">
            <h2>
              Horario de Dr. {medicoHorario.nombre} {medicoHorario.apellido}
            </h2>
            <p className="medico-especialidad-modal">
              {medicoHorario.especialidad}
            </p>

            {cargandoHorario && (
              <p className="horario-cargando">Cargando horario...</p>
            )}

            {horarioMensaje && (
              <p className="horario-sin-datos">{horarioMensaje}</p>
            )}

            {tieneHorario && !cargandoHorario && (
              <div className="horario-info">
                <div className="horario-general">
                  <div className="horario-dato">
                    <span className="horario-etiqueta">Días de atención:</span>
                    <span className="horario-valor">
                      {formatearDias(horarioData.horario.dias)}
                    </span>
                  </div>
                  <div className="horario-dato">
                    <span className="horario-etiqueta">Horario:</span>
                    <span className="horario-valor">
                      {horarioData.horario.hora_inicio} -{" "}
                      {horarioData.horario.hora_fin}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-buttons">
              {tieneHorario && (
                <button
                  type="button"
                  onClick={() => {
                    const medico = medicoHorario;
                    cerrarModalHorario();
                    setMedicoSeleccionado(medico);
                  }}
                  className="btn-confirmar"
                >
                  Programar Cita
                </button>
              )}
              <button
                type="button"
                onClick={cerrarModalHorario}
                className="btn-cancelar"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PROGRAMACION (HU-008) */}
      {medicoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Programar Cita con {medicoSeleccionado.nombre}</h2>
            {mensaje.texto && (
              <div className={`alert ${mensaje.tipo}`}>{mensaje.texto}</div>
            )}

            <form onSubmit={handleProgramarCita}>
              <label>Fecha:</label>
              <input
                type="date"
                required
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
              />

              <label>Hora:</label>
              <input
                type="time"
                required
                onChange={(e) =>
                  setFormData({ ...formData, hora: e.target.value })
                }
              />

              <label>Motivo:</label>
              <textarea
                required
                placeholder="Describa sus sintomas..."
                onChange={(e) =>
                  setFormData({ ...formData, motivo: e.target.value })
                }
              />

              <div className="modal-buttons">
                <button type="submit" className="btn-confirmar">
                  Confirmar Cita
                </button>
                <button
                  type="button"
                  onClick={() => setMedicoSeleccionado(null)}
                  className="btn-cancelar"
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL PARA CALIFICAR MEDICO (HU-205) */}
      {modalCalificarVisible && citaACalificar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Calificar a Dr. {citaACalificar.medico_nombre}</h2>
            {calificacionMensaje.texto && (
              <div className={`alert ${calificacionMensaje.tipo}`}>{calificacionMensaje.texto}</div>
            )}
            <form onSubmit={handleCalificarMedico}>
              <label>Estrellas (0 a 5):</label>
              <input
                type="number"
                min="0"
                max="5"
                value={estrellas}
                onChange={(e) => setEstrellas(Number(e.target.value))}
                required
                style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              <label>Comentario (Opcional):</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="¿Qué tal te pareció la atención?"
                style={{ width: "100%", padding: "10px", marginBottom: "15px", height: "80px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              <div className="modal-buttons">
                <button type="submit" className="btn-confirmar" style={{ backgroundColor: "#ffc107", color: "#000" }}>
                  Enviar Calificación
                </button>
                <button type="button" onClick={() => setModalCalificarVisible(false)} className="btn-cancelar">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPaciente;
