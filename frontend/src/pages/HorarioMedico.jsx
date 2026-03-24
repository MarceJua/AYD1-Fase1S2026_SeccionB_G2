import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DIAS_SEMANA = [
  { valor: "lunes", etiqueta: "Lunes" },
  { valor: "martes", etiqueta: "Martes" },
  { valor: "miercoles", etiqueta: "Miércoles" },
  { valor: "jueves", etiqueta: "Jueves" },
  { valor: "viernes", etiqueta: "Viernes" },
  { valor: "sabado", etiqueta: "Sábado" },
  { valor: "domingo", etiqueta: "Domingo" },
];

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function HorarioMedico() {
  const navigate = useNavigate();
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("17:00");
  const [tieneHorario, setTieneHorario] = useState(false); // false = primera vez
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);  // { tipo: 'exito'|'error', texto, citas? }

  // ─── Cargar horario actual al montar ───────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Sin token: mostrar formulario vacío en modo "Guardar" (primera vez)
      setCargando(false);
      return;
    }

    fetch(`${API}/medico/horarios`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) {
          // 401 sin token válido: igual mostramos el form vacío
          setCargando(false);
          return;
        }
        const data = await r.json();
        if (data.horario) {
          setTieneHorario(true);
          setDiasSeleccionados(data.horario.dias || []);
          // Formatear TIME de PG (HH:MM:SS) a HH:MM para el input
          setHoraInicio((data.horario.hora_inicio || "08:00").slice(0, 5));
          setHoraFin((data.horario.hora_fin || "17:00").slice(0, 5));
        }
        setCargando(false);
      })
      .catch(() => {
        setMensaje({ tipo: "error", texto: "No se pudo cargar el horario actual." });
        setCargando(false);
      });
  }, []);


  // ─── Toggle de checkboxes ──────────────────────────────────────────────
  const toggleDia = (dia) => {
    setDiasSeleccionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  // ─── Enviar formulario ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (diasSeleccionados.length === 0) {
      setMensaje({ tipo: "error", texto: "Selecciona al menos un día de atención." });
      return;
    }
    if (horaInicio >= horaFin) {
      setMensaje({ tipo: "error", texto: "La hora de inicio debe ser anterior a la hora de fin." });
      return;
    }

    const token = localStorage.getItem("token");
    const metodo = tieneHorario ? "PUT" : "POST";
    setGuardando(true);

    try {
      const resp = await fetch(`${API}/medico/horarios`, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dias: diasSeleccionados,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
        }),
      });

      const data = await resp.json();

      if (resp.ok) {
        setTieneHorario(true);
        setMensaje({ tipo: "exito", texto: data.mensaje || "Horario guardado correctamente." });
        setTimeout(() => navigate("/perfil-medico"), 1500);
      } else if (resp.status === 409 && data.citas_conflictivas) {
        // Hay citas activas fuera del nuevo rango
        setMensaje({
          tipo: "error",
          texto: data.error,
          citas: data.citas_conflictivas,
        });
      } else {
        setMensaje({ tipo: "error", texto: data.error || "Ocurrió un error inesperado." });
      }
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexión con el servidor." });
    } finally {
      setGuardando(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div style={styles.centrado}>
        <div style={styles.spinner}></div>
        <p style={{ color: "#94a3b8", marginTop: 12 }}>Cargando horario...</p>
      </div>
    );
  }

  return (
    <div style={styles.pagina}>
      {/* Encabezado */}
      <div style={styles.header}>
        <span style={styles.headerIcon}></span>
        <div>
          <h1 style={styles.titulo}>Gestión de Horario</h1>
          <p style={styles.subtitulo}>
            {tieneHorario
              ? "Actualiza los días y el horario de atención de tu consultorio"
              : "Configura por primera vez tu horario de atención"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard-medico")}
          style={styles.btnHome}
        >
          Ir al Inicio
        </button>
      </div>

      {/* Tarjeta principal */}
      <div style={styles.card}>
        <form onSubmit={handleSubmit}>

          {/* Sección días */}
          <section style={styles.seccion}>
            <h2 style={styles.seccionTitulo}>
              <span style={styles.icono}></span> Días de atención
            </h2>
            <p style={styles.hint}>Selecciona los días en que atenderás pacientes</p>
            <div style={styles.diasGrid}>
              {DIAS_SEMANA.map(({ valor, etiqueta }) => {
                const activo = diasSeleccionados.includes(valor);
                return (
                  <label key={valor} style={{ ...styles.diaLabel, ...(activo ? styles.diaLabelActivo : {}) }}>
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={() => toggleDia(valor)}
                      style={styles.checkbox}
                    />
                    <span style={styles.diaTexto}>{etiqueta}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Sección horario */}
          <section style={styles.seccion}>
            <h2 style={styles.seccionTitulo}>
              <span style={styles.icono}></span> Rango horario
            </h2>
            <p style={styles.hint}>El mismo rango aplica para todos los días seleccionados</p>
            <div style={styles.horasRow}>
              <div style={styles.horaField}>
                <label style={styles.horaLabel}>Hora de inicio</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  style={styles.timeInput}
                  required
                />
              </div>
              <div style={styles.separador}>→</div>
              <div style={styles.horaField}>
                <label style={styles.horaLabel}>Hora de fin</label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  style={styles.timeInput}
                  required
                />
              </div>
            </div>
          </section>

          {/* Mensaje de éxito */}
          {mensaje?.tipo === "exito" && (
            <div style={styles.alertExito}>
              <span>✅</span>
              <span>{mensaje.texto}</span>
            </div>
          )}

          {/* Mensaje de error */}
          {mensaje?.tipo === "error" && (
            <div style={styles.alertError}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18 }}></span>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{mensaje.texto}</p>

                  {/* Lista de citas conflictivas */}
                  {mensaje.citas && mensaje.citas.length > 0 && (
                    <>
                      <p style={{ margin: "8px 0 4px", fontSize: 13, color: "#fca5a5" }}>
                        Citas activas que quedan fuera del nuevo horario:
                      </p>
                      <table style={styles.citasTabla}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Paciente</th>
                            <th style={styles.th}>Fecha</th>
                            <th style={styles.th}>Hora</th>
                            <th style={styles.th}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mensaje.citas.map((c) => (
                            <tr key={c.id}>
                              <td style={styles.td}>{c.paciente_nombre} {c.paciente_apellido}</td>
                              <td style={styles.td}>{c.fecha?.slice(0, 10)}</td>
                              <td style={styles.td}>{c.hora?.slice(0, 5)}</td>
                              <td style={styles.td}>{c.estado}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={guardando}
            style={{ ...styles.btn, ...(guardando ? styles.btnDisabled : {}) }}
          >
            {guardando
              ? "Guardando..."
              : tieneHorario
                ? "Actualizar horario"
                : "Guardar horario"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
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
    alignItems: "center",
    gap: 16,
    justifyContent: "space-between",
    marginBottom: 28,
    maxWidth: 680,
    width: "100%",
    flexWrap: "wrap",
  },
  headerIcon: { fontSize: 48 },
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
  btnHome: {
    background: "rgba(148, 163, 184, 0.1)",
    border: "1px solid rgba(148,163,184,0.25)",
    color: "#cbd5e1",
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
    padding: "32px 36px",
    maxWidth: 680,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    backdropFilter: "blur(10px)",
  },
  seccion: {
    marginBottom: 32,
  },
  seccionTitulo: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: 600,
    margin: "0 0 4px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  icono: { fontSize: 18 },
  hint: {
    color: "#64748b",
    fontSize: 13,
    margin: "0 0 16px",
  },
  diasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
    gap: 10,
  },
  diaLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,0.2)",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "rgba(15, 23, 42, 0.5)",
    userSelect: "none",
  },
  diaLabelActivo: {
    background: "rgba(56, 189, 248, 0.15)",
    border: "1px solid rgba(56, 189, 248, 0.5)",
    boxShadow: "0 0 12px rgba(56, 189, 248, 0.1)",
  },
  checkbox: {
    accentColor: "#38bdf8",
    width: 16,
    height: 16,
    cursor: "pointer",
  },
  diaTexto: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: 500,
  },
  horasRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 16,
    flexWrap: "wrap",
  },
  horaField: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    minWidth: 160,
  },
  horaLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 500,
  },
  timeInput: {
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148,163,184,0.25)",
    borderRadius: 10,
    color: "#f1f5f9",
    fontSize: 20,
    fontWeight: 600,
    padding: "10px 14px",
    outline: "none",
    cursor: "pointer",
    transition: "border-color 0.2s",
    colorScheme: "dark",
  },
  separador: {
    color: "#475569",
    fontSize: 22,
    fontWeight: 600,
    paddingBottom: 10,
  },
  alertExito: {
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    borderRadius: 10,
    color: "#86efac",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    fontSize: 14,
  },
  alertError: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    borderRadius: 10,
    color: "#fca5a5",
    padding: "14px 16px",
    marginBottom: 20,
    fontSize: 14,
  },
  citasTabla: {
    width: "100%",
    marginTop: 8,
    borderCollapse: "collapse",
    fontSize: 12,
  },
  th: {
    color: "#fca5a5",
    textAlign: "left",
    padding: "4px 8px",
    borderBottom: "1px solid rgba(239,68,68,0.3)",
    fontWeight: 600,
  },
  td: {
    color: "#fecaca",
    padding: "4px 8px",
    borderBottom: "1px solid rgba(239,68,68,0.15)",
  },
  btn: {
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #0284c7, #38bdf8)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.5px",
    boxShadow: "0 4px 20px rgba(56,189,248,0.3)",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};
