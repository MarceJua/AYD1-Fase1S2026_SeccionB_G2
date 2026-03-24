// import { useState, useEffect } from "react";
// import axios from "axios";
// import "../styles/Dashboard.css";
// import { useNavigate } from "react-router-dom";

// const DashboardPaciente = () => {
//   const [vista, setVista] = useState("medicos"); // "medicos" | "citas"
//   const [medicos, setMedicos] = useState([]);
//   const [especialidadFiltro, setEspecialidadFiltro] = useState("");
//   const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
//   const [formData, setFormData] = useState({ fecha: "", hora: "", motivo: "" });
//   const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

//   // HU-018: estados para ver horario
//   const [medicoHorario, setMedicoHorario] = useState(null);
//   const [horarioData, setHorarioData] = useState(null);
//   const [fechaFiltro, setFechaFiltro] = useState("");
//   const [cargandoHorario, setCargandoHorario] = useState(false);
//   const [horarioMensaje, setHorarioMensaje] = useState("");

//   // HU-019: estados para mis citas
//   const [misCitas, setMisCitas] = useState([]);
//   const [cargandoCitas, setCargandoCitas] = useState(false);

//   const navigate = useNavigate();
//   const usuario = JSON.parse(localStorage.getItem("usuario"));

//   useEffect(() => {
//     const fetchMedicos = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_API_URL}/paciente/medicos`);
//         setMedicos(response.data);
//       } catch (error) {
//         console.error("Error cargando medicos", error);
//       }
//     };
//     fetchMedicos();
//   }, []);

//   // HU-019: cargar citas cuando se cambia a la vista de citas
//   useEffect(() => {
//     if (vista !== "citas") return;
//     const fetchCitas = async () => {
//       setCargandoCitas(true);
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_API_URL}/paciente/mis-citas/${usuario.id}`
//         );
//         setMisCitas(response.data.citas);
//       } catch (error) {
//         console.error("Error cargando citas", error);
//       } finally {
//         setCargandoCitas(false);
//       }
//     };
//     fetchCitas();
//   }, [vista]);

//   const handleProgramarCita = async (e) => {
//     e.preventDefault();
//     setMensaje({ texto: "", tipo: "" });

//     try {
//       const payload = {
//         medico_id: medicoSeleccionado.id,
//         paciente_id: usuario.id,
//         ...formData,
//       };

//       await axios.post(`${import.meta.env.VITE_API_URL}/paciente/programar-cita`, payload);
//       setMensaje({ texto: "Cita programada con exito.", tipo: "success" });
//       setTimeout(() => setMedicoSeleccionado(null), 2000);
//     } catch (error) {
//       setMensaje({
//         texto: error.response?.data?.error || "Error al programar la cita",
//         tipo: "error",
//       });
//     }
//   };

//   // HU-018: abrir modal de horario y cargar datos sin fecha
//   const handleVerHorario = async (medico) => {
//     setMedicoHorario(medico);
//     setFechaFiltro("");
//     setHorarioData(null);
//     setHorarioMensaje("");
//     setCargandoHorario(true);

//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_API_URL}/paciente/medicos/${medico.id}/horario`
//       );
//       setHorarioData(res.data);
//       if (!res.data.horario) {
//         setHorarioMensaje("Este medico aun no ha configurado su horario de atencion.");
//       }
//     } catch (error) {
//       setHorarioMensaje("Error al cargar el horario del medico.");
//     } finally {
//       setCargandoHorario(false);
//     }
//   };

//   // HU-018: consultar slots para la fecha seleccionada
//   const handleFechaFiltro = async (fecha) => {
//     setFechaFiltro(fecha);
//     if (!fecha || !medicoHorario) return;

//     setCargandoHorario(true);
//     setHorarioMensaje("");

//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_API_URL}/paciente/medicos/${medicoHorario.id}/horario?fecha=${fecha}`
//       );
//       setHorarioData(res.data);
//     } catch (error) {
//       setHorarioMensaje("Error al consultar disponibilidad para esa fecha.");
//     } finally {
//       setCargandoHorario(false);
//     }
//   };

//   const cerrarModalHorario = () => {
//     setMedicoHorario(null);
//     setHorarioData(null);
//     setFechaFiltro("");
//     setHorarioMensaje("");
//   };

//   const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

//   const formatearDias = (dias) => {
//     if (!dias || dias.length === 0) return "Sin dias configurados";
//     return dias.map(capitalizar).join(", ");
//   };

//   const formatearFecha = (fechaStr) => {
//     const date = new Date(fechaStr);
//     const day = String(date.getUTCDate()).padStart(2, "0");
//     const month = String(date.getUTCMonth() + 1).padStart(2, "0");
//     const year = date.getUTCFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const formatearHora = (horaStr) => horaStr.slice(0, 5);

//   const medicosFiltrados = medicos.filter((medico) =>
//     medico.especialidad.toLowerCase().includes(especialidadFiltro.toLowerCase())
//   );

//   const tieneHorario = horarioData && horarioData.horario;

//   return (
//     <div className="dashboard-container">
//       <header className="dashboard-header">
//         <h1>Portal del Paciente</h1>
//         <button onClick={() => navigate("/login")}>Cerrar Sesion</button>
//       </header>

//       <div className="dashboard-tabs">
//         <button
//           className={`tab-btn ${vista === "medicos" ? "tab-btn-activo" : ""}`}
//           onClick={() => setVista("medicos")}
//         >
//           Medicos
//         </button>
//         <button
//           className={`tab-btn ${vista === "citas" ? "tab-btn-activo" : ""}`}
//           onClick={() => setVista("citas")}
//         >
//           Mis Citas
//         </button>
//       </div>

//       {/* VISTA: MEDICOS */}
//       {vista === "medicos" && (
//         <>
//           <section className="search-section">
//             <input
//               type="text"
//               placeholder="Filtrar por especialidad..."
//               onChange={(e) => setEspecialidadFiltro(e.target.value)}
//             />
//           </section>

//           <section className="medicos-grid">
//             {medicosFiltrados.map((medico) => (
//               <div key={medico.id} className="medico-card">
//                 <h3>{medico.nombre}</h3>
//                 <p>{medico.especialidad}</p>
//                 <div className="card-buttons">
//                   <button
//                     onClick={() => handleVerHorario(medico)}
//                     className="btn-horario"
//                   >
//                     Ver Horario
//                   </button>
//                   <button
//                     onClick={() => setMedicoSeleccionado(medico)}
//                     className="btn-ver-horarios"
//                   >
//                     Programar Cita
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </section>
//         </>
//       )}

//       {/* VISTA: MIS CITAS (HU-019) */}
//       {vista === "citas" && (
//         <section className="mis-citas-section">
//           <h2 className="mis-citas-titulo">Mis citas pendientes de atencion</h2>

//           {cargandoCitas && <p className="citas-cargando">Cargando citas...</p>}

//           {!cargandoCitas && misCitas.length === 0 && (
//             <p className="citas-vacio">No tienes citas activas en este momento.</p>
//           )}

//           {!cargandoCitas && misCitas.length > 0 && (
//             <div className="citas-lista">
//               {misCitas.map((cita) => (
//                 <div key={cita.id} className="cita-card">
//                   <div className="cita-fila">
//                     <span className="cita-etiqueta">Medico:</span>
//                     <span className="cita-valor">
//                       {cita.medico_nombre} {cita.medico_apellido}
//                     </span>
//                   </div>
//                   <div className="cita-fila">
//                     <span className="cita-etiqueta">Fecha:</span>
//                     <span className="cita-valor">{formatearFecha(cita.fecha)}</span>
//                   </div>
//                   <div className="cita-fila">
//                     <span className="cita-etiqueta">Hora:</span>
//                     <span className="cita-valor">{formatearHora(cita.hora)}</span>
//                   </div>
//                   <div className="cita-fila">
//                     <span className="cita-etiqueta">Clinica:</span>
//                     <span className="cita-valor">{cita.direccion_clinica}</span>
//                   </div>
//                   <div className="cita-fila cita-fila-motivo">
//                     <span className="cita-etiqueta">Motivo:</span>
//                     <span className="cita-valor">{cita.motivo}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       )}

//       {/* MODAL DE HORARIO (HU-018) */}
//       {medicoHorario && (
//         <div className="modal-overlay">
//           <div className="modal-content modal-horario">
//             <h2>Horario de {medicoHorario.nombre}</h2>
//             <p className="medico-especialidad-modal">{medicoHorario.especialidad}</p>

//             {cargandoHorario && <p className="horario-cargando">Cargando horario...</p>}

//             {horarioMensaje && (
//               <p className="horario-sin-datos">{horarioMensaje}</p>
//             )}

//             {tieneHorario && !cargandoHorario && (
//               <div className="horario-info">
//                 <div className="horario-general">
//                   <div className="horario-dato">
//                     <span className="horario-etiqueta">Dias de atencion:</span>
//                     <span className="horario-valor">
//                       {formatearDias(horarioData.horario.dias)}
//                     </span>
//                   </div>
//                   <div className="horario-dato">
//                     <span className="horario-etiqueta">Horario:</span>
//                     <span className="horario-valor">
//                       {horarioData.horario.hora_inicio} - {horarioData.horario.hora_fin}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="horario-filtro-fecha">
//                   <label className="horario-etiqueta">
//                     Consultar disponibilidad para una fecha:
//                   </label>
//                   <input
//                     type="date"
//                     value={fechaFiltro}
//                     onChange={(e) => handleFechaFiltro(e.target.value)}
//                     className="input-fecha-filtro"
//                   />
//                 </div>

//                 {fechaFiltro && !cargandoHorario && horarioData.fecha && (
//                   <div className="horario-slots-container">
//                     {!horarioData.atiende_ese_dia ? (
//                       <p className="horario-no-atiende">
//                         El medico no atiende los dias {capitalizar(horarioData.dia_semana)}.
//                       </p>
//                     ) : (
//                       <>
//                         <p className="slots-titulo">
//                           Disponibilidad para el {fechaFiltro} ({capitalizar(horarioData.dia_semana)}):
//                         </p>
//                         <div className="slots-leyenda">
//                           <span className="slot-legend slot-disponible-legend">Disponible</span>
//                           <span className="slot-legend slot-ocupado-legend">Ocupado</span>
//                         </div>
//                         <div className="slots-grid">
//                           {horarioData.slots.length === 0 ? (
//                             <p className="horario-sin-datos">
//                               No hay horarios configurados para este dia.
//                             </p>
//                           ) : (
//                             horarioData.slots.map((slot) => (
//                               <div
//                                 key={slot.hora}
//                                 className={`slot ${slot.disponible ? "slot-disponible" : "slot-ocupado"}`}
//                               >
//                                 {slot.hora}
//                                 <span className="slot-estado">
//                                   {slot.disponible ? "Libre" : "Ocupado"}
//                                 </span>
//                               </div>
//                             ))
//                           )}
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             <div className="modal-buttons">
//               {tieneHorario && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     const medico = medicoHorario;
//                     cerrarModalHorario();
//                     setMedicoSeleccionado(medico);
//                   }}
//                   className="btn-confirmar"
//                 >
//                   Programar Cita
//                 </button>
//               )}
//               <button type="button" onClick={cerrarModalHorario} className="btn-cancelar">
//                 Cerrar
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* MODAL DE PROGRAMACION (HU-008) */}
//       {medicoSeleccionado && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <h2>Programar Cita con {medicoSeleccionado.nombre}</h2>
//             {mensaje.texto && (
//               <div className={`alert ${mensaje.tipo}`}>{mensaje.texto}</div>
//             )}

//             <form onSubmit={handleProgramarCita}>
//               <label>Fecha:</label>
//               <input
//                 type="date"
//                 required
//                 onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
//               />

//               <label>Hora:</label>
//               <input
//                 type="time"
//                 required
//                 onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
//               />

//               <label>Motivo:</label>
//               <textarea
//                 required
//                 placeholder="Describa sus sintomas..."
//                 onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
//               />

//               <div className="modal-buttons">
//                 <button type="submit" className="btn-confirmar">
//                   Confirmar Cita
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setMedicoSeleccionado(null)}
//                   className="btn-cancelar"
//                 >
//                   Cerrar
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DashboardPaciente;

import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

const DashboardPaciente = () => {
  const [vista, setVista] = useState("medicos"); // "medicos" | "citas" | "historial"
  const [medicos, setMedicos] = useState([]);
  const [especialidadFiltro, setEspecialidadFiltro] = useState("");
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({ fecha: "", hora: "", motivo: "" });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // HU-018: estados para ver horario
  const [medicoHorario, setMedicoHorario] = useState(null);
  const [horarioData, setHorarioData] = useState(null);
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [cargandoHorario, setCargandoHorario] = useState(false);
  const [horarioMensaje, setHorarioMensaje] = useState("");

  // HU-019: estados para mis citas y el historial
  const [misCitas, setMisCitas] = useState([]);
  const [historialCitas, setHistorialCitas] = useState([]);
  const [cargandoCitas, setCargandoCitas] = useState(false);

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/paciente/medicos`,
        );
        setMedicos(response.data);
      } catch (error) {
        console.error("Error cargando medicos", error);
      }
    };
    fetchMedicos();
  }, []);

  // HU-019: cargar citas activas o historial dependiendo de la pestaña seleccionada
  useEffect(() => {
    if (vista !== "citas" && vista !== "historial") return;

    const fetchCitasYHistorial = async () => {
      setCargandoCitas(true);
      try {
        if (vista === "citas") {
          const resActivas = await axios.get(
            `${import.meta.env.VITE_API_URL}/paciente/mis-citas/${usuario.id}`,
          );
          setMisCitas(resActivas.data.citas);
        } else if (vista === "historial") {
          const resHistorial = await axios.get(
            `${import.meta.env.VITE_API_URL}/paciente/historial-citas/${usuario.id}`,
          );
          setHistorialCitas(resHistorial.data.historial);
        }
      } catch (error) {
        console.error("Error cargando la información de citas", error);
      } finally {
        setCargandoCitas(false);
      }
    };
    fetchCitasYHistorial();
  }, [vista, usuario.id]);

  const handleProgramarCita = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    try {
      const payload = {
        medico_id: medicoSeleccionado.id,
        paciente_id: usuario.id,
        ...formData,
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/paciente/programar-cita`,
        payload,
      );
      setMensaje({ texto: "Cita programada con exito.", tipo: "success" });
      setTimeout(() => setMedicoSeleccionado(null), 2000);
    } catch (error) {
      setMensaje({
        texto: error.response?.data?.error || "Error al programar la cita",
        tipo: "error",
      });
    }
  };

  // HU-019: Función para Cancelar la Cita
  const handleCancelarCita = async (citaId) => {
    if (
      !window.confirm(
        "¿Estás seguro de cancelar esta cita? Recuerda que debes hacerlo con al menos 24 horas de anticipación.",
      )
    ) {
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/paciente/cita/${citaId}/cancelar`,
      );
      alert("✅ Cita cancelada exitosamente.");

      // Recargar la lista de citas activas para que desaparezca la que acabamos de cancelar
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/paciente/mis-citas/${usuario.id}`,
      );
      setMisCitas(response.data.citas);
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.error || "Error al cancelar la cita"}`);
    }
  };

  const handleVerHorario = async (medico) => {
    setMedicoHorario(medico);
    setFechaFiltro("");
    setHorarioData(null);
    setHorarioMensaje("");
    setCargandoHorario(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/paciente/medicos/${medico.id}/horario`,
      );
      setHorarioData(res.data);
      if (!res.data.horario) {
        setHorarioMensaje(
          "Este medico aun no ha configurado su horario de atencion.",
        );
      }
    } catch (error) {
      setHorarioMensaje("Error al cargar el horario del medico.");
    } finally {
      setCargandoHorario(false);
    }
  };

  const handleFechaFiltro = async (fecha) => {
    setFechaFiltro(fecha);
    if (!fecha || !medicoHorario) return;

    setCargandoHorario(true);
    setHorarioMensaje("");

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/paciente/medicos/${medicoHorario.id}/horario?fecha=${fecha}`,
      );
      setHorarioData(res.data);
    } catch (error) {
      setHorarioMensaje("Error al consultar disponibilidad para esa fecha.");
    } finally {
      setCargandoHorario(false);
    }
  };

  const cerrarModalHorario = () => {
    setMedicoHorario(null);
    setHorarioData(null);
    setFechaFiltro("");
    setHorarioMensaje("");
  };

  const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const formatearDias = (dias) => {
    if (!dias || dias.length === 0) return "Sin dias configurados";
    return dias.map(capitalizar).join(", ");
  };

  const formatearFecha = (fechaStr) => {
    const date = new Date(fechaStr);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Ajuste de zona horaria
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatearHora = (horaStr) => horaStr.slice(0, 5);

  const medicosFiltrados = medicos.filter((medico) =>
    medico.especialidad
      .toLowerCase()
      .includes(especialidadFiltro.toLowerCase()),
  );

  const tieneHorario = horarioData && horarioData.horario;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Portal del Paciente</h1>
        <button onClick={() => navigate("/login")}>Cerrar Sesion</button>
      </header>

      {/* TABS DE NAVEGACIÓN */}
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
        {/* NUEVA PESTAÑA: HISTORIAL */}
        <button
          className={`tab-btn ${vista === "historial" ? "tab-btn-activo" : ""}`}
          onClick={() => setVista("historial")}
        >
          Historial Médico
        </button>
      </div>

      {/* VISTA: MEDICOS (Intacta de tu compañero) */}
      {vista === "medicos" && (
        <>
          <section className="search-section">
            <input
              type="text"
              placeholder="Filtrar por especialidad..."
              onChange={(e) => setEspecialidadFiltro(e.target.value)}
            />
          </section>

          <section className="medicos-grid">
            {medicosFiltrados.map((medico) => (
              <div key={medico.id} className="medico-card">
                <h3>{medico.nombre}</h3>
                <p>{medico.especialidad}</p>
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

      {/* VISTA: MIS CITAS (HU-019 - Activas y Botón Cancelar) */}
      {vista === "citas" && (
        <section className="mis-citas-section">
          <h2 className="mis-citas-titulo">Mis citas pendientes de atencion</h2>

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

      {/* VISTA: HISTORIAL MÉDICO (HU-019 - Nueva Sección) */}
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
                    borderLeft: `5px solid ${cita.estado === "atendida" ? "#28a745" : "#dc3545"}`,
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
                    <span className="cita-etiqueta">Estado:</span>
                    <span
                      className="cita-valor"
                      style={{
                        color:
                          cita.estado === "atendida" ? "#28a745" : "#dc3545",
                        fontWeight: "bold",
                        textTransform: "capitalize",
                      }}
                    >
                      {cita.estado}
                    </span>
                  </div>
                  <div className="cita-fila cita-fila-motivo">
                    <span className="cita-etiqueta">Motivo Inicial:</span>
                    <span className="cita-valor">{cita.motivo}</span>
                  </div>

                  {cita.estado === "atendida" && (
                    <div
                      className="cita-fila cita-fila-motivo"
                      style={{
                        marginTop: "10px",
                        padding: "10px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "5px",
                      }}
                    >
                      <span className="cita-etiqueta">💊 Tratamiento:</span>
                      <span className="cita-valor">
                        {cita.tratamiento || "Sin tratamiento registrado."}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* MODAL DE HORARIO y PROGRAMACIÓN (Intactos de tu compañero) */}
      {/* ... [El resto de tu código de los modales sigue exactamente igual abajo] ... */}

      {/* MODAL DE HORARIO (HU-018) */}
      {medicoHorario && (
        <div className="modal-overlay">
          <div className="modal-content modal-horario">
            <h2>Horario de {medicoHorario.nombre}</h2>
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
                    <span className="horario-etiqueta">Dias de atencion:</span>
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

                <div className="horario-filtro-fecha">
                  <label className="horario-etiqueta">
                    Consultar disponibilidad para una fecha:
                  </label>
                  <input
                    type="date"
                    value={fechaFiltro}
                    onChange={(e) => handleFechaFiltro(e.target.value)}
                    className="input-fecha-filtro"
                  />
                </div>

                {fechaFiltro && !cargandoHorario && horarioData.fecha && (
                  <div className="horario-slots-container">
                    {!horarioData.atiende_ese_dia ? (
                      <p className="horario-no-atiende">
                        El medico no atiende los dias{" "}
                        {capitalizar(horarioData.dia_semana)}.
                      </p>
                    ) : (
                      <>
                        <p className="slots-titulo">
                          Disponibilidad para el {fechaFiltro} (
                          {capitalizar(horarioData.dia_semana)}):
                        </p>
                        <div className="slots-leyenda">
                          <span className="slot-legend slot-disponible-legend">
                            Disponible
                          </span>
                          <span className="slot-legend slot-ocupado-legend">
                            Ocupado
                          </span>
                        </div>
                        <div className="slots-grid">
                          {horarioData.slots.length === 0 ? (
                            <p className="horario-sin-datos">
                              No hay horarios configurados para este dia.
                            </p>
                          ) : (
                            horarioData.slots.map((slot) => (
                              <div
                                key={slot.hora}
                                className={`slot ${slot.disponible ? "slot-disponible" : "slot-ocupado"}`}
                              >
                                {slot.hora}
                                <span className="slot-estado">
                                  {slot.disponible ? "Libre" : "Ocupado"}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
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
    </div>
  );
};

export default DashboardPaciente;
