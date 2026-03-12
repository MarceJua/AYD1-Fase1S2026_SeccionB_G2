import '../styles/Login_Register_Paciente.css';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importar para redirección
import axios from 'axios';

const RegistroMedico = () => {
  const navigate = useNavigate(); // Inicializar
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dpi: '',
    fecha_nacimiento: '',
    genero: '',
    direccion: '',
    telefono: '',
    numero_colegiado: '',
    especialidad: '',
    direccion_clinica: '',
    correo: '',
    password: ''
  });

  const [foto, setFoto] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!foto) {
        alert("La fotografía es obligatoria para médicos.");
        return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('foto', foto);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/medico/registro', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.mensaje);
      navigate('/login'); // Redirigir al login tras éxito
    } catch (error) {
      alert(error.response?.data?.error || "Error al registrar");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h2 className="auth-logo">SaludPlus</h2>
        <p className="auth-subtitle">Registro de Médico Profesional</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid">
            
            <div className="auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Nombre:</label>
              <input className="auth-input" type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
            </div>

            <div className="auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Apellido:</label>
              <input className="auth-input" type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
            </div>

            <div className="auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>DPI:</label>
              <input className="auth-input" type="text" name="dpi" value={formData.dpi} onChange={handleChange} maxLength="13" required />
            </div>

            <div className="auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Fecha de Nacimiento:</label>
              <input className="auth-input" type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required />
            </div>

            <div className="auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Género:</label>
              <select className="auth-input" name="genero" value={formData.genero} onChange={handleChange} required>
                <option value="">Seleccione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <div className="auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Teléfono:</label>
              <input className="auth-input" type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
            </div>

            <div className="auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Colegiado:</label>
              <input className="auth-input" type="text" name="numero_colegiado" value={formData.numero_colegiado} onChange={handleChange} required />
            </div>

            <div className="auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Especialidad:</label>
              <input className="auth-input" type="text" name="especialidad" value={formData.especialidad} onChange={handleChange} required />
            </div>

            <div className="full-width auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Dirección de la Clínica:</label>
              <input className="auth-input" type="text" name="direccion_clinica" value={formData.direccion_clinica} onChange={handleChange} required />
            </div>

            <div className="full-width auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Correo Electrónico:</label>
              <input className="auth-input" type="email" name="correo" value={formData.correo} onChange={handleChange} required />
            </div>

            <div className="full-width auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Contraseña:</label>
              <input className="auth-input" type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="full-width auth-form" style={{ textAlign: 'left', gap: '5px' }}>
              <label style={{ fontSize: '14px', color: '#64748b' }}>Foto (Obligatoria):</label>
              <input type="file" onChange={handleFileChange} accept="image/*" required />
            </div>
          </div>

          <button type="submit" className="auth-button">Registrarse como Médico</button>
        </form>
        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default RegistroMedico;