import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css"; // Crearemos este CSS después
import { useNavigate } from "react-router-dom";

const DashboardPaciente = () => {
  const [medicos, setMedicos] = useState([]);
  const [especialidadFiltro, setEspecialidadFiltro] = useState("");
  const navigate = useNavigate();

  // funcion para redirigir al login
  const handleLogout = () => {
    // Borramos los datos de la sesión actual
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    // Redirigimos al login
    navigate("/login");
  };
  // Cargar médicos al iniciar la pantalla
  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/paciente/medicos`,
        );
        setMedicos(response.data);
      } catch (error) {
        console.error("Error cargando médicos", error);
      }
    };
    fetchMedicos();
  }, []);

  // Lógica de filtrado
  const medicosFiltrados = medicos.filter((medico) =>
    medico.especialidad
      .toLowerCase()
      .includes(especialidadFiltro.toLowerCase()),
  );

  // Función auxiliar (importada del Admin) para construir la ruta de la imagen
  const getImageUrl = (rutaFoto) => {
    // Si no hay foto, devolvemos un placeholder de 110px para que cuadre con tu diseño
    if (!rutaFoto) return "https://via.placeholder.com/110";

    // Extraemos solo el nombre del archivo (ignorando carpetas y diagonales)
    const nombreArchivo = rutaFoto.split("\\").pop().split("/").pop();

    return `http://localhost:5000/uploads/${nombreArchivo}`;
  };

  return (
    <div className="dashboard-container">
      {/* 3. Agregamos el botón en el header */}
      <header className="dashboard-header">
        <div className="header-top">
          <h1>Portal del Paciente</h1>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
        <p>Encuentra a tu especialista ideal</p>
      </header>

      <section className="search-section">
        <input
          type="text"
          placeholder="🔍 Buscar por especialidad (ej. Cardiología)..."
          value={especialidadFiltro}
          onChange={(e) => setEspecialidadFiltro(e.target.value)}
          className="search-input"
        />
      </section>

      <section className="medicos-grid">
        {medicosFiltrados.length > 0 ? (
          medicosFiltrados.map((medico) => (
            <div key={medico.id} className="medico-card">
              <img
                src={getImageUrl(medico.foto)}
                alt={medico.nombre}
                className="medico-foto"
              />
              <h3>{medico.nombre}</h3>
              <p className="especialidad">{medico.especialidad}</p>
              <p className="direccion">📍 {medico.direccion_clinica}</p>
              <button className="btn-ver-horarios">Ver Horarios</button>
            </div>
          ))
        ) : (
          <p className="no-results">
            No se encontraron médicos con esa especialidad.
          </p>
        )}
      </section>
    </div>
  );
};

export default DashboardPaciente;
