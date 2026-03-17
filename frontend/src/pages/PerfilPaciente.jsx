import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css"; // Reutilizamos el estilo general para mantener consistencia

const PerfilPaciente = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    dpi: "", // El DPI lo mostramos pero lo dejaremos bloqueado (read-only)
  });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [usuarioId, setUsuarioId] = useState(null);

  // Cargar datos actuales del usuario al entrar a la pantalla
  useEffect(() => {
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioLogueado) {
      setUsuarioId(usuarioLogueado.id);
      setFormData({
        nombre: usuarioLogueado.nombre || "",
        correo: usuarioLogueado.correo || "",
        dpi: usuarioLogueado.dpi || "",
      });
    } else {
      navigate("/login"); // Si no hay usuario, lo mandamos al login
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "Actualizando...", tipo: "info" });

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/paciente/perfil/${usuarioId}`,
        { nombre: formData.nombre, correo: formData.correo },
      );

      // Actualizamos el localStorage con los nuevos datos
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));

      setMensaje({ texto: `${response.data.mensaje}`, tipo: "success" });
    } catch (error) {
      setMensaje({
        texto: `${error.response?.data?.error || "Error al actualizar perfil"}`,
        tipo: "error",
      });
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-top">
          <h1>Mi Perfil</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-ver-horarios"
            style={{ width: "auto" }}
          >
            Volver al Dashboard
          </button>
        </div>
        <p>Actualiza tu información personal</p>
      </header>

      <div
        className="medico-card"
        style={{ maxWidth: "500px", margin: "0 auto", textAlign: "left" }}
      >
        {mensaje.texto && (
          <div
            style={{
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "5px",
              backgroundColor: mensaje.tipo === "error" ? "#f8d7da" : "#d4edda",
              color: mensaje.tipo === "error" ? "#842029" : "#155724",
            }}
          >
            {mensaje.texto}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div>
            <label style={{ fontWeight: "bold", color: "#333" }}>
              DPI (No editable)
            </label>
            <input
              type="text"
              value={formData.dpi}
              disabled
              className="search-input"
              style={{
                width: "100%",
                backgroundColor: "#e9ecef",
                cursor: "not-allowed",
                marginTop: "5px",
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: "bold", color: "#333" }}>
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="search-input"
              style={{ width: "100%", marginTop: "5px" }}
            />
          </div>

          <div>
            <label style={{ fontWeight: "bold", color: "#333" }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
              className="search-input"
              style={{ width: "100%", marginTop: "5px" }}
            />
          </div>

          <button
            type="submit"
            className="btn-ver-horarios"
            style={{ marginTop: "10px" }}
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default PerfilPaciente;
