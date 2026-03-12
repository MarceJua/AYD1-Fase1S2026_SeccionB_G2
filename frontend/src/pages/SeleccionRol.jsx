import { Link } from "react-router-dom";
import "../styles/Login_Register_Paciente.css";

const SeleccionRol = () => (
  <div className="auth-container">
    <div className="auth-card">
      <h2 className="auth-logo">Registrarse en SaludPlus</h2>
      <p className="auth-subtitle">Selecciona tu perfil de usuario</p>
      <div className="auth-form">
        <Link to="/registro" className="auth-button" style={{textDecoration: 'none'}}>Soy Paciente</Link>
        <Link to="/registro-medico" className="auth-button" style={{textDecoration: 'none', backgroundColor: '#64748b'}}>Soy Médico</Link>
      </div>
      <div className="auth-footer">
      <Link to="/login">Volver al inicio de sesión</Link>
      </div>
    </div>
  </div>
);
export default SeleccionRol;