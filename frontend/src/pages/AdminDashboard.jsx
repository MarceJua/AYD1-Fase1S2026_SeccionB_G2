import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  // Declarar funciones ARRIBA del useEffect
  const fetchPendientes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin-login');
        return;
      }

      const config = { headers: { 'Authorization': `Bearer ${token}` } };

      // Obtener Médicos
      const resMedicos = await fetch('http://localhost:5000/api/auth/admin/medicos-pendientes', config);
      if (resMedicos.ok) setMedicos(await resMedicos.json());

      // Obtener Pacientes
      const resPacientes = await fetch('http://localhost:5000/api/auth/admin/pacientes-pendientes', config);
      if (resPacientes.ok) setPacientes(await resPacientes.json());

    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPendientes();
  }, []);

  const handleAccion = async (tipo, accion, id) => {
    if (!window.confirm(`¿Estás seguro de ${accion.toUpperCase()} a este ${tipo}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/admin/${accion}-${tipo}/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setMensaje(` ${tipo === 'medico' ? 'Médico' : 'Paciente'} ${accion}do exitosamente`);
        if (tipo === 'medico') {
          setMedicos(medicos.filter(m => m.id !== id));
        } else {
          setPacientes(pacientes.filter(p => p.id !== id));
        }
      }
    } catch (error) {
      console.error(`Error al ${accion}:`, error);
    }
  };

  // Función auxiliar para construir la ruta de la imagen
  const getImageUrl = (rutaFoto) => {
    return rutaFoto ? `http://localhost:5000/${rutaFoto.replace(/\\/g, '/')}` : 'https://via.placeholder.com/50';
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2> Panel de Administración - SaludPlus</h2>
        <button className="btn-logout" onClick={() => { localStorage.removeItem('token'); navigate('/admin-login'); }}>Cerrar Sesión</button>
      </div>
      
      {mensaje && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', marginBottom: '20px', borderRadius: '5px' }}>{mensaje}</div>}

      {/* SECCIÓN DE MÉDICOS */}
      <h3>📋 Médicos Pendientes de Aprobación</h3>
      {medicos.length === 0 ? <p>No hay médicos pendientes.</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nombre Completo</th>
              <th>DPI</th>
              <th>Género</th>
              <th>Colegiado</th>
              <th>Especialidad</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicos.map(medico => (
              <tr key={medico.id}>
                <td><img src={getImageUrl(medico.foto)} alt="Perfil" className="foto-perfil" /></td>
                <td>{medico.nombre} {medico.apellido}</td>
                <td>{medico.dpi}</td>
                <td>{medico.genero}</td>
                <td>{medico.numero_colegiado}</td>
                <td>{medico.especialidad}</td>
                <td>{medico.correo}</td>
                <td>
                  <button className="btn-aprobar" onClick={() => handleAccion('medico', 'aprobar', medico.id)}>Aceptar</button>
                  <button className="btn-rechazar" onClick={() => handleAccion('medico', 'rechazar', medico.id)}>Rechazar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* SECCIÓN DE PACIENTES */}
      <h3>📋 Pacientes Pendientes de Aprobación</h3>
      {pacientes.length === 0 ? <p>No hay pacientes pendientes.</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nombre Completo</th>
              <th>DPI</th>
              <th>Género</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map(paciente => (
              <tr key={paciente.id}>
                {/* Si no tiene foto, getImageUrl devuelve un placeholder por defecto */}
                <td><img src={getImageUrl(paciente.foto)} alt="Perfil" className="foto-perfil" /></td>
                <td>{paciente.nombre} {paciente.apellido}</td>
                <td>{paciente.dpi}</td>
                <td>{paciente.genero}</td>
                <td>{paciente.correo}</td>
                <td>
                  <button className="btn-aprobar" onClick={() => handleAccion('paciente', 'aprobar', paciente.id)}>Aceptar</button>
                  <button className="btn-rechazar" onClick={() => handleAccion('paciente', 'rechazar', paciente.id)}>Rechazar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;