import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login_Register_Paciente.css";

const RegistroPaciente = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    dpi: "",
    correo: "",
    password: "",
  });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/paciente/registro`,
        formData,
      );
      setMensaje({ texto: "" + response.data.mensaje, tipo: "success" });

      // Esperar 2 segundos y redirigir al login
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMensaje({
        texto: "❌ " + (error.response?.data?.error || "Error al registrar"),
        tipo: "error",
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">SaludPlus</h1>
        <p className="auth-subtitle">Crea tu cuenta como paciente</p>

        {mensaje.texto && (
          <div className={`auth-message ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            required
            onChange={handleChange}
          />
          <input
            className="auth-input"
            type="text"
            name="dpi"
            placeholder="DPI (13 dígitos)"
            required
            onChange={handleChange}
          />
          <input
            className="auth-input"
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            required
            onChange={handleChange}
          />
          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Contraseña segura"
            required
            onChange={handleChange}
          />
          <button className="auth-button" type="submit">
            Registrarme
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default RegistroPaciente;
