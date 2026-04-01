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
  
  // Estados para el token de verificación (HU-202)
  const [mostrarTokenInput, setMostrarTokenInput] = useState(false);
  const [tokenVerificacion, setTokenVerificacion] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Preparamos el payload. Si el input del token está visible, lo agregamos.
    const payload = { ...formData };
    if (mostrarTokenInput) {
      payload.token = tokenVerificacion;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/paciente/login`,
        payload
      );

      // Guardar el token en el navegador
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));

      setMensaje({ texto: "Inicio de sesión exitoso", tipo: "success" });

      // Redirigir a la página principal del paciente (HU-007)
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      // INTERCEPTAR LÓGICA DEL TOKEN (HU-202)
      if (error.response?.data?.requiereToken) {
        setMostrarTokenInput(true);
        setMensaje({
          texto: "⚠️ " + error.response.data.error,
          tipo: "error", // Aparecerá rojo para llamar la atención
        });
        return; // Salimos de la función para no ejecutar el error normal
      }

      // Lógica de error normal
      setMensaje({
        texto: "❌ " + (error.response?.data?.error || "Credenciales inválidas"),
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
            disabled={mostrarTokenInput} // Bloqueamos el correo si ya estamos validando token
          />
          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            onChange={handleChange}
            disabled={mostrarTokenInput} // Bloqueamos la contra si ya estamos validando token
          />

          {/* NUEVO INPUT CONDICIONAL PARA EL TOKEN */}
          {mostrarTokenInput && (
            <input
              className="auth-input token-input"
              type="text"
              name="token"
              placeholder="Código de verificación (Ej. A7B9X2)"
              required
              maxLength="6"
              value={tokenVerificacion}
              onChange={(e) => setTokenVerificacion(e.target.value.toUpperCase())}
              style={{ letterSpacing: '3px', textAlign: 'center', fontWeight: 'bold' }}
            />
          )}

          <button className="auth-button" type="submit">
            {mostrarTokenInput ? "Verificar y Entrar" : "Entrar a mi portal"}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes cuenta? <Link to="/seleccion-registro">Regístrate aquí</Link>
        </div>
        <div className="auth-footer">
          ¿Eres médico? <Link to="/login-medico">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPaciente;