import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login_Register_Paciente.css";

const LoginMedico = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ correo: "", password: "" });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // Estados para el token de verificación (HU-202)
  const [mostrarTokenInput, setMostrarTokenInput] = useState(false);
  const [tokenVerificacion, setTokenVerificacion] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Preparamos el payload. Si el input del token está visible, lo agregamos.
    const payload = { ...formData };
    if (mostrarTokenInput) {
      payload.token = tokenVerificacion;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/medico/login`, payload);
      const token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      setMensaje({ texto: "Inicio de sesión exitoso", tipo: "success" });

      // Primera vez: si no hay horario, debe configurarlo antes de entrar al dashboard.
      try {
        const horarioRes = await axios.get(`${import.meta.env.VITE_API_URL}/medico/horarios`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (horarioRes.data?.horario) {
          setTimeout(() => navigate("/dashboard-medico"), 1000);
        } else {
          setTimeout(() => navigate("/horario-medico"), 1000);
        }
      } catch {
        // Si falla la consulta de horario, se envía a configuración para completar onboarding.
        setTimeout(() => navigate("/horario-medico"), 1000);
      }

    } catch (error) {
      // INTERCEPTAR LÓGICA DEL TOKEN (HU-202)
      if (error.response?.data?.requiereToken) {
        setMostrarTokenInput(true);
        setMensaje({ texto: "⚠️ " + error.response.data.error, tipo: "error" });
        return; // Salimos de la función
      }

      setMensaje({ texto: "❌ " + (error.response?.data?.error || "Credenciales inválidas"), tipo: "error" });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">SaludPlus</h1>
        <p className="auth-subtitle">Portal para Médicos</p>
        {mensaje.texto && <div className={`auth-message ${mensaje.tipo}`}>{mensaje.texto}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <input 
            className="auth-input" 
            type="email" 
            name="correo" 
            placeholder="Correo electrónico" 
            required 
            onChange={handleChange} 
            disabled={mostrarTokenInput}
          />
          <input 
            className="auth-input" 
            type="password" 
            name="password" 
            placeholder="Contraseña" 
            required 
            onChange={handleChange} 
            disabled={mostrarTokenInput}
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

          <button className="auth-button" type="submit" style={{ backgroundColor: '#64748b' }}>
            {mostrarTokenInput ? "Verificar y Entrar" : "Entrar como Médico"}
          </button>
        </form>

        <div className="auth-footer">
          ¿Eres paciente? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginMedico;