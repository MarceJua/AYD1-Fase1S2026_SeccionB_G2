import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login_Register_Paciente.css";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usuario: "",
    password: "",
  });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/admin/login`,
        formData,
      );

      // El servidor devuelve un token temporal y requiere 2FA
      if (response.data.requiere2FA) {
        setMensaje({ 
          texto: "Primer factor completado. Continúe con el segundo factor.", 
          tipo: "success" 
        });

        // Redirigir a la página de segundo factor con el token temporal
        setTimeout(() => {
          navigate("/admin-2fa", { 
            state: { tokenTemporal: response.data.tokenTemporal } 
          });
        }, 1500);
      }
    } catch (error) {
      setMensaje({
        texto:
          " " + (error.response?.data?.error || "Credenciales inválidas"),
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">SaludPlus Admin</h1>
        <p className="auth-subtitle">Primer Factor de Autenticación</p>

        {mensaje.texto && (
          <div className={`auth-message ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="text"
            name="usuario"
            placeholder="Usuario"
            required
            value={formData.usuario}
            onChange={handleChange}
            disabled={cargando}
          />
          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            value={formData.password}
            onChange={handleChange}
            disabled={cargando}
          />
          <button className="auth-button" type="submit" disabled={cargando}>
            {cargando ? "Validando..." : "Continuar"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Volver al inicio de sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
