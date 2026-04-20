import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const medicamentoVacio = () => ({ nombre: '', cantidad: '', tiempo: '', descripcion_dosis: '' });

const DashboardMedico = () => {
  const [citas, setCitas] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [vistaActiva, setVistaActiva] = useState('pendientes');
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [medicamentos, setMedicamentos] = useState([medicamentoVacio()]);
  const [mensajeExito, setMensajeExito] = useState('');
  // ESTADOS PARA HU-205 (Calificar Paciente)
  const [modalCalificarVisible, setModalCalificarVisible] = useState(false);
  const [citaACalificar, setCitaACalificar] = useState(null);
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState("");

  const abrirModalCalificar = (cita) => {
    setCitaACalificar(cita);
    setEstrellas(5);
    setComentario("");
    setError("");
    setMensajeExito("");
    setModalCalificarVisible(true);
  };

  const handleCalificarPaciente = async (e) => {
    e.preventDefault();
    setError("");
    setMensajeExito("");

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API}/medico/citas/calificar-paciente`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cita_id: citaACalificar.cita_id,
          estrellas: estrellas,
          comentario: comentario,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMensajeExito(data.mensaje);
        setTimeout(() => {
          setModalCalificarVisible(false);
          setCitaACalificar(null);
          setMensajeExito("");
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Error de conexión al calificar al paciente.");
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCitas = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login-medico");
        return;
      }

      try {
        const response = await fetch(`${API}/medico/citas/pendientes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setCitas(data.citas || []);
        } else {
          setError(data.error || "Error al obtener las citas");
        }
      } catch {
        setError("Error de conexión con el servidor");
      } finally {
        setCargando(false);
      }
    };

    fetchCitas();
  }, [navigate]);

  useEffect(() => {
    if (vistaActiva === "historial") {
      fetchHistorial();
    }
  }, [vistaActiva]);

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-ES", { timeZone: "UTC" });
  };

  if (cargando) {
    return (
      <div style={styles.centrado}>
        <div style={styles.spinner}></div>
        <p style={{ color: "#94a3b8", marginTop: 12 }}>Cargando citas pendientes...</p>
      </div>
    );
  }

  const fetchHistorial = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API}/medico/citas/historial`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setHistorial(data.historial || []);
      } else {
        setError(data.error || "Error al obtener el historial de citas.");
      }
    } catch {
      setError("Error de conexión al obtener el historial.");
    }
  };

  const abrirModal = (cita) => {
    setCitaSeleccionada(cita);
    setDiagnostico('');
    setMedicamentos([medicamentoVacio()]);
    setError('');
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setCitaSeleccionada(null);
    setDiagnostico('');
    setMedicamentos([medicamentoVacio()]);
  };

  const agregarMedicamento = () => {
    setMedicamentos((prev) => [...prev, medicamentoVacio()]);
  };

  const eliminarMedicamento = (index) => {
    setMedicamentos((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizarMedicamento = (index, campo, valor) => {
    setMedicamentos((prev) =>
      prev.map((med, i) => (i === index ? { ...med, [campo]: valor } : med))
    );
  };

  const handleAtenderCita = async (e) => {
    e.preventDefault();
    setError('');

    if (!diagnostico.trim()) {
      setError("El diagnóstico es obligatorio.");
      return;
    }
    const todosCompletos = medicamentos.every(
      (m) => m.nombre.trim() && m.cantidad.trim() && m.tiempo.trim() && m.descripcion_dosis.trim()
    );
    if (!todosCompletos) {
      setError("Todos los campos de cada medicamento son obligatorios.");
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API}/medico/citas/${citaSeleccionada.cita_id}/atender`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          diagnostico: diagnostico.trim(),
          medicamentos: medicamentos.map((m) => ({
            nombre: m.nombre.trim(),
            cantidad: m.cantidad.trim(),
            tiempo: m.tiempo.trim(),
            descripcion_dosis: m.descripcion_dosis.trim(),
          })),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMensajeExito(data.mensaje);
        setTimeout(() => setMensajeExito(''), 3000);
        setCitas((prevCitas) => prevCitas.filter((c) => c.cita_id !== citaSeleccionada.cita_id));
        cerrarModal();
        if (vistaActiva === "historial") fetchHistorial();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Error de conexión al guardar el tratamiento.');
    }
  };

// Función para cancelar la cita
const handleCancelarCita = async (cita) => {
  // Pedimos confirmación para evitar clics accidentales
  const confirmacion = window.confirm(`¿Estás seguro de que deseas cancelar la cita con ${cita.paciente_nombre}? Se enviará un correo electrónico de notificación automáticamente.`);

  if (!confirmacion) return;

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API}/medico/citas/${cita.cita_id}/cancelar`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      setMensajeExito(data.mensaje);
      setTimeout(() => setMensajeExito(""), 4000);

      // Quitar la cita de la tabla visualmente
      setCitas((prevCitas) => prevCitas.filter((c) => c.cita_id !== cita.cita_id));
    } else {
      setError(data.error);
    }
  } catch {
    setError("Error de conexión al cancelar la cita.");
  }
};

  return (
    <div style={styles.pagina}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.titulo}>Panel del Médico</h1>
          <p style={styles.subtitulo}>Consulta y gestiona tus citas pendientes</p>
        </div>
        <div style={styles.accionesHeader}>
          <button onClick={() => navigate("/perfil-medico")} style={styles.btnSecundario}>
            Mi Perfil
          </button>
          <button onClick={() => navigate("/horario-medico")} style={styles.btnSecundario}>
            Mi Horario
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("usuario");
              navigate("/login-medico");
            }}
            style={styles.btnCerrarSesion}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div style={styles.card}>
        {error && <div style={styles.alertError}>{error}</div>}
        {mensajeExito && <div style={styles.alertExito}>{mensajeExito}</div>}

        <div style={styles.vistaSwitch}>
          <button
            style={{ ...styles.btnVista, ...(vistaActiva === "pendientes" ? styles.btnVistaActiva : {}) }}
            onClick={() => setVistaActiva("pendientes")}
          >
            Citas Pendientes
          </button>
          <button
            style={{ ...styles.btnVista, ...(vistaActiva === "historial" ? styles.btnVistaActiva : {}) }}
            onClick={() => setVistaActiva("historial")}
          >
            Historial de Citas
          </button>
        </div>

        {vistaActiva === "pendientes" && citas.length === 0 && !error ? (
          <p style={styles.sinCitas}>No tienes citas pendientes por el momento.</p>
        ) : (
          <>
            {vistaActiva === "pendientes" ? (
              <div style={styles.tablaWrapper}>
                <table style={styles.citasTabla}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Fecha</th>
                      <th style={styles.th}>Hora</th>
                      <th style={styles.th}>Paciente</th>
                      <th style={styles.th}>Motivo</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citas.map((cita) => (
                      <tr key={cita.cita_id}>
                        <td style={styles.td}>{formatearFecha(cita.fecha)}</td>
                        <td style={styles.td}>{cita.hora}</td>
                        <td style={styles.td}>{`${cita.paciente_nombre} ${cita.paciente_apellido}`}</td>
                        <td style={styles.td}>{cita.motivo}</td>
                        <td style={styles.tdAcciones}>
                          <button style={styles.btnAtender} onClick={() => abrirModal(cita)}>
                            Atender
                          </button>
                          <button style={styles.btnCancelar} onClick={() => handleCancelarCita(cita)}>
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : historial.length === 0 ? (
              <p style={styles.sinCitas}>No hay citas en el historial todavía.</p>
            ) : (
              <div style={styles.tablaWrapper}>
                <table style={styles.citasTabla}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Fecha</th>
                      <th style={styles.th}>Hora</th>
                      <th style={styles.th}>Paciente</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((cita) => (
                      <tr key={cita.cita_id}>
                        <td style={styles.td}>{formatearFecha(cita.fecha)}</td>
                        <td style={styles.td}>{cita.hora}</td>
                        <td style={styles.td}>{`${cita.paciente_nombre} ${cita.paciente_apellido}`}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.estadoBadge,
                              ...(cita.estado?.toLowerCase().includes("atendido")
                                ? styles.estadoAtendido
                                : styles.estadoCancelado),
                            }}
                          >
                            {cita.estado}
                          </span>
                        </td>
                        {/* TD PARA HU-205 */}
                        <td style={styles.td}>
                          {cita.estado?.toLowerCase().includes("atendido") && (
                            <button
                              style={{...styles.btnSecundario, color: "#eab308", borderColor: "#eab308"}}
                              onClick={() => abrirModalCalificar(cita)}
                            >
                              Calificar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Modal para Atender Paciente - HU-203 */}
        {modalVisible && (
          <div style={styles.modalOverlay} onClick={cerrarModal}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitulo}>Atender Paciente</h2>

              <div style={styles.modalInfo}>
                <p style={styles.modalParagrafo}>
                  <strong style={styles.modalLabel}>Paciente:</strong> {citaSeleccionada?.paciente_nombre} {citaSeleccionada?.paciente_apellido}
                </p>
                <p style={styles.modalParagrafo}>
                  <strong style={styles.modalLabel}>Motivo:</strong> {citaSeleccionada?.motivo}
                </p>
              </div>

              {error && <div style={styles.alertError}>{error}</div>}

              <form onSubmit={handleAtenderCita}>
                {/* Diagnóstico */}
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Diagnóstico <span style={{ color: '#f87171' }}>*</span></label>
                  <input
                    type="text"
                    style={styles.inputField}
                    required
                    placeholder="Ej: Diabetes tipo 2, Arritmia cardíaca..."
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                  />
                </div>

                {/* Sección Medicamentos */}
                <div style={styles.seccionMedicamentos}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={styles.seccionLabel}>Medicamentos <span style={{ color: '#f87171' }}>*</span></span>
                    <button type="button" style={styles.btnAgregar} onClick={agregarMedicamento}>
                      + Agregar medicamento
                    </button>
                  </div>

                  {medicamentos.map((med, index) => (
                    <div key={index} style={styles.medicamentoCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600 }}>Medicamento {index + 1}</span>
                        {medicamentos.length > 1 && (
                          <button type="button" style={styles.btnEliminar} onClick={() => eliminarMedicamento(index)}>
                            Eliminar
                          </button>
                        )}
                      </div>
                      <div style={styles.medGrid}>
                        <div style={styles.formGroup}>
                          <label style={styles.formLabelSmall}>Nombre <span style={{ color: '#f87171' }}>*</span></label>
                          <input
                            type="text"
                            style={styles.inputField}
                            placeholder="Ej: Metformina"
                            value={med.nombre}
                            onChange={(e) => actualizarMedicamento(index, 'nombre', e.target.value)}
                            required
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.formLabelSmall}>Cantidad <span style={{ color: '#f87171' }}>*</span></label>
                          <input
                            type="text"
                            style={styles.inputField}
                            placeholder="Ej: 1 caja, 2 frascos"
                            value={med.cantidad}
                            onChange={(e) => actualizarMedicamento(index, 'cantidad', e.target.value)}
                            required
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.formLabelSmall}>Tiempo <span style={{ color: '#f87171' }}>*</span></label>
                          <input
                            type="text"
                            style={styles.inputField}
                            placeholder="Ej: 15 días, 1 mes"
                            value={med.tiempo}
                            onChange={(e) => actualizarMedicamento(index, 'tiempo', e.target.value)}
                            required
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.formLabelSmall}>Descripción de dosis <span style={{ color: '#f87171' }}>*</span></label>
                          <input
                            type="text"
                            style={styles.inputField}
                            placeholder="Ej: Tomar 1 pastilla cada 8 horas"
                            value={med.descripcion_dosis}
                            onChange={(e) => actualizarMedicamento(index, 'descripcion_dosis', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.modalAcciones}>
                  <button type="button" style={styles.btnModalCancelar} onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnModalGuardar}>
                    Guardar Tratamiento
                  </button>
                </div>
              </form>

              {mensajeExito && (
                <div style={styles.alertExitoModal}>
                  <span>✅</span>
                  <span>{mensajeExito}</span>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Modal para Calificar Paciente (HU-205) */}
        {modalCalificarVisible && citaACalificar && (
          <div style={styles.modalOverlay} onClick={() => setModalCalificarVisible(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitulo}>Calificar Paciente: {citaACalificar.paciente_nombre}</h2>
              {error && <div style={styles.alertError}>{error}</div>}
              {mensajeExito && <div style={styles.alertExitoModal}><span>✅</span><span>{mensajeExito}</span></div>}
              
              <form onSubmit={handleCalificarPaciente}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Estrellas (0 a 5) <span style={{ color: '#f87171' }}>*</span></label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    style={styles.inputField}
                    value={estrellas}
                    onChange={(e) => setEstrellas(Number(e.target.value))}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Comentario (Opcional)</label>
                  <textarea
                    style={styles.textarea}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Ej: El paciente fue puntual y siguió las instrucciones."
                    rows="3"
                  />
                </div>
                <div style={styles.modalAcciones}>
                  <button type="button" style={styles.btnModalCancelar} onClick={() => setModalCalificarVisible(false)}>
                    Cancelar
                  </button>
                  <button type="submit" style={{...styles.btnModalGuardar, background: "linear-gradient(135deg, #eab308, #ca8a04)"}}>
                    Enviar Calificación
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMedico;

const styles = {
  pagina: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  centrado: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #334155",
    borderTop: "3px solid #38bdf8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    maxWidth: 980,
    width: "100%",
    gap: 16,
    flexWrap: "wrap",
  },
  titulo: {
    color: "#f1f5f9",
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  subtitulo: {
    color: "#94a3b8",
    fontSize: 14,
    margin: "4px 0 0",
  },
  accionesHeader: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  btnSecundario: {
    background: "rgba(148, 163, 184, 0.1)",
    border: "1px solid rgba(148,163,184,0.25)",
    color: "#cbd5e1",
    borderRadius: 10,
    padding: "8px 18px",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 500,
  },
  btnCerrarSesion: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239,68,68,0.4)",
    color: "#fca5a5",
    borderRadius: 10,
    padding: "8px 18px",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 500,
  },
  card: {
    background: "rgba(30, 41, 59, 0.9)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    borderRadius: 16,
    padding: "24px",
    maxWidth: 980,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    backdropFilter: "blur(10px)",
  },
  alertError: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    borderRadius: 10,
    color: "#fca5a5",
    padding: "12px 16px",
    fontSize: 14,
    marginBottom: 20,
  },
  sinCitas: {
    color: "#cbd5e1",
    fontSize: 15,
    margin: 0,
  },
  alertExito: {
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    borderRadius: 10,
    color: "#86efac",
    padding: "12px 16px",
    fontSize: 14,
    marginBottom: 20,
  },
  vistaSwitch: {
    display: "flex",
    gap: 10,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  btnVista: {
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid rgba(148,163,184,0.2)",
    color: "#cbd5e1",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
  },
  btnVistaActiva: {
    background: "rgba(56, 189, 248, 0.15)",
    border: "1px solid rgba(56,189,248,0.5)",
    color: "#e0f2fe",
  },
  tablaWrapper: {
    overflowX: "auto",
  },
  citasTabla: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
    minWidth: 780,
  },
  th: {
    color: "#94a3b8",
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "1px solid rgba(148,163,184,0.2)",
    fontWeight: 600,
  },
  td: {
    color: "#e2e8f0",
    padding: "10px 12px",
    borderBottom: "1px solid rgba(148,163,184,0.12)",
    verticalAlign: "top",
  },
  estadoBadge: {
    display: "inline-block",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid transparent",
    textTransform: "capitalize",
  },
  estadoAtendido: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34,197,94,0.5)",
    color: "#86efac",
  },
  estadoCancelado: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(248,113,113,0.55)",
    color: "#fecaca",
  },
  tdAcciones: {
    display: "flex",
    gap: 8,
    padding: "10px 12px",
    borderBottom: "1px solid rgba(148,163,184,0.12)",
  },
  btnAtender: {
    background: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34,197,94,0.5)",
    color: "#86efac",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
  },
  btnCancelar: {
    background: "rgba(239, 68, 68, 0.16)",
    border: "1px solid rgba(248,113,113,0.55)",
    color: "#fecaca",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 2px 10px rgba(239,68,68,0.2)",
  },
  // ─── Modal Styles ─────────────────────────────────────────────
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    background: "rgba(30, 41, 59, 0.95)",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: 16,
    padding: "28px",
    maxWidth: 700,
    width: "95%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(10px)",
    animation: "slideIn 0.3s ease-out",
  },
  modalTitulo: {
    color: "#f1f5f9",
    fontSize: 20,
    fontWeight: 700,
    margin: "0 0 16px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
    paddingBottom: 12,
  },
  modalInfo: {
    background: "rgba(15, 23, 42, 0.5)",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 20,
    border: "1px solid rgba(148, 163, 184, 0.1)",
  },
  modalParagrafo: {
    color: "#cbd5e1",
    fontSize: 13,
    margin: "6px 0",
  },
  modalLabel: {
    color: "#e2e8f0",
    fontWeight: 600,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
  },
  textarea: {
    width: "100%",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: 10,
    color: "#f1f5f9",
    fontSize: 14,
    padding: "12px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  modalAcciones: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 20,
  },
  btnModalCancelar: {
    background: "rgba(239, 68, 68, 0.16)",
    border: "1px solid rgba(248,113,113,0.55)",
    color: "#fecaca",
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s",
    boxShadow: "0 2px 10px rgba(239,68,68,0.2)",
  },
  btnModalGuardar: {
    background: "linear-gradient(135deg, #0284c7, #38bdf8)",
    border: "none",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 20px",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
    transition: "all 0.2s",
  },
  inputField: {
    width: "100%",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: 8,
    color: "#f1f5f9",
    fontSize: 13,
    padding: "9px 12px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },
  seccionMedicamentos: {
    marginBottom: 20,
    background: "rgba(15, 23, 42, 0.3)",
    borderRadius: 10,
    padding: "14px",
    border: "1px solid rgba(148, 163, 184, 0.15)",
  },
  seccionLabel: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: 700,
  },
  medicamentoCard: {
    background: "rgba(30, 41, 59, 0.7)",
    borderRadius: 8,
    padding: "12px",
    marginBottom: 10,
    border: "1px solid rgba(148, 163, 184, 0.15)",
  },
  medGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  formLabelSmall: {
    display: "block",
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 5,
  },
  btnAgregar: {
    background: "rgba(56, 189, 248, 0.12)",
    border: "1px solid rgba(56,189,248,0.4)",
    color: "#7dd3fc",
    borderRadius: 7,
    padding: "5px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600,
  },
  btnEliminar: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(248,113,113,0.4)",
    color: "#fca5a5",
    borderRadius: 6,
    padding: "3px 9px",
    fontSize: 11,
    cursor: "pointer",
    fontWeight: 600,
  },
  alertExitoModal: {
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    borderRadius: 10,
    color: "#86efac",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    fontSize: 13,
    fontWeight: 500,
  },
};