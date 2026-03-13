import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Login_Register_Paciente.css";

const Admin2FA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password2fa, setPassword2fa] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [cargando, setCargando] = useState(false);

  // Obtener token temporal del estado anterior
  const tokenTemporal = location.state?.tokenTemporal;

  // Si no hay token temporal, redirigir al login
  if (!tokenTemporal) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-logo">Acceso Denegado</h1>
          <p className="auth-subtitle">Por favor, inicia sesión primero</p>
          <button 
            className="auth-button" 
            onClick={() => navigate("/admin-login")}
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setPassword2fa(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/admin/validar-2fa`,
        { password2fa },
        {
          headers: {
            Authorization: `Bearer ${tokenTemporal}`,
          },
        }
      );

      // Guardar el token definitivo
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      localStorage.setItem("rol", "admin");

      setMensaje({ 
        texto: " Segundo factor validado. Acceso otorgado.", 
        tipo: "success" 
      });

      // Redirigir al panel del administrador
      setTimeout(() => navigate("/admin-dashboard"), 1500);
    } catch (error) {
      setMensaje({
        texto:
          " " + (error.response?.data?.error || "Error en la validación"),
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">Segundo Factor de Autenticación</h1>
        <p className="auth-subtitle">Ingresa la contraseña encriptada del archivo</p>

        {mensaje.texto && (
          <div className={`auth-message ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <p style={{ fontSize: "0.9em", marginBottom: "1rem", color: "#666" }}>
            Ingresa la contraseña encriptada que se encuentra en el archivo auth2-ayd1.txt
          </p>
          <input
            className="auth-input"
            type="password"
            placeholder="Contraseña de segundo factor"
            required
            value={password2fa}
            onChange={handleChange}
            disabled={cargando}
          />
          <button className="auth-button" type="submit" disabled={cargando}>
            {cargando ? "Validando..." : "Validar Acceso"}
          </button>
        </form>

        <div className="auth-footer">
          <button 
            onClick={() => navigate("/admin-login")}
            style={{ 
              background: "none", 
              border: "none", 
              color: "#007bff", 
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            Volver al primer factor
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin2FA;
