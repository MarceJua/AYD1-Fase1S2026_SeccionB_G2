import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login_Register_Paciente.css";

const LoginMedico = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ correo: "", password: "" });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/medico/login`, formData);
      const token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      setMensaje({ texto: "Inicio de sesión exitoso", tipo: "success" });

      // Verificar si el médico ya tiene horario configurado
      try {
        const horarioRes = await axios.get(`${import.meta.env.VITE_API_URL}/medico/horarios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (horarioRes.data.horario) {
          setTimeout(() => navigate("/perfil-medico"), 1000);
        } else {
          setTimeout(() => navigate("/horario-medico"), 1000);
        }
      } catch {
        
        setTimeout(() => navigate("/horario-medico"), 1000);
      }

    } catch (error) {
      setMensaje({ texto: (error.response?.data?.error || "Credenciales inválidas"), tipo: "error" });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">SaludPlus</h1>
        <p className="auth-subtitle">Portal para Médicos</p>
        {mensaje.texto && <div className={`auth-message ${mensaje.tipo}`}>{mensaje.texto}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input className="auth-input" type="email" name="correo" placeholder="Correo electrónico" required onChange={handleChange} />
          <input className="auth-input" type="password" name="password" placeholder="Contraseña" required onChange={handleChange} />
          <button className="auth-button" type="submit" style={{ backgroundColor: '#64748b' }}>Entrar como Médico</button>
        </form>
        <div className="auth-footer">
          ¿Eres paciente? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginMedico;