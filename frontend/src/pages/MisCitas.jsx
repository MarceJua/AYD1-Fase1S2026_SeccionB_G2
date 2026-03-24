import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const MisCitas = () => {
  const navigate = useNavigate();
  const [citasActivas, setCitasActivas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [vistaActual, setVistaActual] = useState("activas");
  const [errorMensaje, setErrorMensaje] = useState("");
  const usuarioId = JSON.parse(localStorage.getItem("usuario"))?.id ?? null;

  async function cargarDatos(id) {
    try {
      // 1. Cargamos las citas activas (Endpoint de tu compañero)
      const resActivas = await axios.get(
        `${import.meta.env.VITE_API_URL}/paciente/mis-citas/${id}`,
      );
      setCitasActivas(resActivas.data.citas);

      // 2. Cargamos el historial (Nuestro nuevo endpoint)
      const resHistorial = await axios.get(
        `${import.meta.env.VITE_API_URL}/paciente/historial-citas/${id}`,
      );
      setHistorial(resHistorial.data.historial);
    } catch (error) {
      console.error("Error al cargar citas", error);
    }
  }

  useEffect(() => {
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
    if (!usuarioLogueado) {
      navigate("/login");
      return;
    }

    const id = usuarioLogueado.id;

    axios
      .all([
        axios.get(`${import.meta.env.VITE_API_URL}/paciente/mis-citas/${id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/paciente/historial-citas/${id}`),
      ])
      .then(([resActivas, resHistorial]) => {
        setCitasActivas(resActivas.data.citas);
        setHistorial(resHistorial.data.historial);
      })
      .catch((error) => {
        console.error("Error al cargar citas", error);
      });
  }, [navigate]);

  const handleCancelarCita = async (citaId) => {
    setErrorMensaje("");
    if (
      !window.confirm(
        "¿Estás seguro de cancelar esta cita? Recuerda que debe ser con 24 horas de anticipación.",
      )
    ) {
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/paciente/cita/${citaId}/cancelar`,
      );
      alert("✅ Cita cancelada exitosamente.");
      cargarDatos(usuarioId); // Recargamos para mover la cita de Activas a Historial
    } catch (error) {
      setErrorMensaje(
        error.response?.data?.error || "Error al cancelar la cita",
      );
      // Ocultar mensaje de error después de 5 segundos
      setTimeout(() => setErrorMensaje(""), 5000);
    }
  };

  // Función para formatear fechas a DD/MM/YYYY
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return fecha.toLocaleDateString("es-ES");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-top">
          <h1>📅 Gestión de Citas</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-ver-horarios"
            style={{ width: "auto" }}
          >
            ⬅️ Volver al Dashboard
          </button>
        </div>
        <p>Revisa tus consultas programadas y tu historial de atención</p>
      </header>

      {/* Tabs / Pestañas de navegación */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => setVistaActual("activas")}
          style={{
            padding: "10px 20px",
            backgroundColor: vistaActual === "activas" ? "#0056b3" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Próximas Citas
        </button>
        <button
          onClick={() => setVistaActual("historial")}
          style={{
            padding: "10px 20px",
            backgroundColor: vistaActual === "historial" ? "#6c757d" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Historial Médico
        </button>
      </div>

      {/* Mensaje de Error (Ej: Regla de 24 horas) */}
      {errorMensaje && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#f8d7da",
            color: "#842029",
            borderRadius: "5px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          ⚠️ {errorMensaje}
        </div>
      )}

      {/* VISTA 1: CITAS ACTIVAS */}
      {vistaActual === "activas" && (
        <section className="medicos-grid">
          {citasActivas.length > 0 ? (
            citasActivas.map((cita) => (
              <div
                key={cita.id}
                className="medico-card"
                style={{ borderLeft: "5px solid #0056b3" }}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>
                  Dr. {cita.medico_nombre} {cita.medico_apellido}
                </h3>
                <p>
                  <strong>Clínica:</strong> {cita.direccion_clinica}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: "10px 0",
                    padding: "10px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "5px",
                  }}
                >
                  <span>
                    <strong>📅 Fecha:</strong> {formatearFecha(cita.fecha)}
                  </span>
                  <span>
                    <strong>⏰ Hora:</strong> {cita.hora.slice(0, 5)}
                  </span>
                </div>
                <p>
                  <strong>Motivo:</strong> {cita.motivo}
                </p>
                <button
                  onClick={() => handleCancelarCita(cita.id)}
                  className="btn-logout"
                  style={{ width: "100%", marginTop: "15px" }}
                >
                  ❌ Cancelar Consulta
                </button>
              </div>
            ))
          ) : (
            <p className="no-results" style={{ gridColumn: "1 / -1" }}>
              No tienes citas activas programadas.
            </p>
          )}
        </section>
      )}

      {/* VISTA 2: HISTORIAL */}
      {vistaActual === "historial" && (
        <section className="medicos-grid">
          {historial.length > 0 ? (
            historial.map((cita) => (
              <div
                key={cita.id}
                className="medico-card"
                style={{
                  borderLeft: `5px solid ${(cita.estado_mostrable || cita.estado) === "Atendido" ? "#28a745" : "#dc3545"}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h3 style={{ margin: 0 }}>Dr. {cita.medico_nombre}</h3>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "white",
                      backgroundColor:
                        cita.estado === "atendida" ? "#28a745" : "#dc3545",
                      textTransform: "capitalize",
                    }}
                  >
                    {cita.estado}
                  </span>
                </div>
                <p>
                  <strong>Especialidad:</strong> {cita.especialidad}
                </p>
                <p>
                  <strong>Clínica:</strong> {cita.direccion_clinica}
                </p>
                <p>
                  <strong>Fecha Atendida:</strong> {formatearFecha(cita.fecha)}{" "}
                  a las {cita.hora.slice(0, 5)}
                </p>
                <p>
                  <strong>Estado:</strong> {cita.estado_mostrable || cita.estado}
                </p>

                {(cita.estado_mostrable || cita.estado) === "Atendido" && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      backgroundColor: "#d4edda",
                      borderRadius: "5px",
                      fontSize: "14px",
                      color: "#155724",
                    }}
                  >
                    <strong>💊 Tratamiento:</strong>{" "}
                    {cita.tratamiento || "Sin indicaciones adicionales."}
                  </div>
                )}
                {(cita.estado_mostrable || cita.estado).startsWith("Cancelada") && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      backgroundColor: "#f8d7da",
                      borderRadius: "5px",
                      fontSize: "14px",
                      color: "#842029",
                    }}
                  >
                    <strong>Motivo original:</strong> {cita.motivo}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="no-results" style={{ gridColumn: "1 / -1" }}>
              No hay registros previos en tu historial.
            </p>
          )}
        </section>
      )}
    </div>
  );
};

export default MisCitas;
