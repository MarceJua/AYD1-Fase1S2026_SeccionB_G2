import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css"; 
import { useNavigate } from "react-router-dom";

const DashboardPaciente = () => {
  const [medicos, setMedicos] = useState([]);
  const [especialidadFiltro, setEspecialidadFiltro] = useState("");
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null); // Para el modal
  const [formData, setFormData] = useState({ fecha: "", hora: "", motivo: "" });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario")); // Obtenemos el ID del paciente logueado

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/paciente/medicos`);
        setMedicos(response.data);
      } catch (error) {
        console.error("Error cargando médicos", error);
      }
    };
    fetchMedicos();
  }, []);

  const handleProgramarCita = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    try {
      const payload = {
        medico_id: medicoSeleccionado.id,
        paciente_id: usuario.id,
        ...formData
      };

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/paciente/programar-cita`, payload);
      
      setMensaje({ texto: "¡Cita programada con éxito!", tipo: "success" });
      setTimeout(() => setMedicoSeleccionado(null), 2000); // Cerrar modal tras éxito
    } catch (error) {
      setMensaje({ 
        texto: error.response?.data?.error || "Error al programar la cita", 
        tipo: "error" 
      });
    }
  };

  const medicosFiltrados = medicos.filter((medico) =>
    medico.especialidad.toLowerCase().includes(especialidadFiltro.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Portal del Paciente</h1>
        <button onClick={() => navigate("/login")}>Cerrar Sesión</button>
      </header>

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
            {/* Botón que activa el modal */}
            <button onClick={() => setMedicoSeleccionado(medico)} className="btn-ver-horarios">
              Programar Cita
            </button>
          </div>
        ))}
      </section>

      {/* MODAL DE PROGRAMACIÓN (HU-008) */}
      {medicoSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Programar Cita con Dr. {medicoSeleccionado.nombre}</h2>
            {mensaje.texto && <div className={`alert ${mensaje.tipo}`}>{mensaje.texto}</div>}
            
            <form onSubmit={handleProgramarCita}>
              <label>Fecha:</label>
              <input type="date" required onChange={(e) => setFormData({...formData, fecha: e.target.value})} />
              
              <label>Hora:</label>
              <input type="time" required onChange={(e) => setFormData({...formData, hora: e.target.value})} />
              
              <label>Motivo:</label>
              <textarea required placeholder="Describa sus síntomas..." onChange={(e) => setFormData({...formData, motivo: e.target.value})} />
              
              <div className="modal-buttons">
                <button type="submit" className="btn-confirmar">Confirmar Cita</button>
                <button type="button" onClick={() => setMedicoSeleccionado(null)} className="btn-cancelar">Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPaciente;