import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DashboardMedico = () => {
  const [citas, setCitas] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
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

        {citas.length === 0 && !error ? (
          <p style={styles.sinCitas}>No tienes citas pendientes por el momento.</p>
        ) : (
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
                      <button style={styles.btnAtender}>Atender</button>
                      <button style={styles.btnCancelar}>Cancelar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239,68,68,0.5)",
    color: "#fca5a5",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
  },
};