import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login_Register_Paciente.css";

const LoginPaciente = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
        `${import.meta.env.VITE_API_URL}/auth/paciente/login`,
        formData,
      );

      // Guardar el token en el navegador
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));

      setMensaje({ texto: "Inicio de sesión exitoso", tipo: "success" });

      // Redirigir a la página principal del paciente (HU-007)
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      setMensaje({
        texto:
          "❌ " + (error.response?.data?.error || "Credenciales inválidas"),
        tipo: "error",
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">SaludPlus</h1>
        <p className="auth-subtitle">Bienvenido de nuevo</p>

        {mensaje.texto && (
          <div className={`auth-message ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
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
            placeholder="Contraseña"
            required
            onChange={handleChange}
          />
          <button className="auth-button" type="submit">
            Entrar a mi portal
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPaciente;
