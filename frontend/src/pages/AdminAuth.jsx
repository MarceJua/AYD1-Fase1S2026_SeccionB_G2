import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminAuth2() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file || file.name !== 'auth2-ayd1.txt') {
      setError('El archivo debe llamarse auth2-ayd1.txt');
      return;
    }

    const formData = new FormData();
    formData.append('authFile', file);

    const tempToken = sessionStorage.getItem('adminTempToken');

    try {
      const { data } = await axios.post('/api/admin/verify-file', formData, {
        headers: {
          Authorization: `Bearer ${tempToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      // Guardar token final y redirigir al panel
      localStorage.setItem('adminToken', data.token);
      sessionStorage.removeItem('adminTempToken');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Archivo inválido');
    }
  };

  return (
    <div className="admin-auth2">
      <h2>Segunda Autenticación</h2>
      <p>Sube el archivo <strong>auth2-ayd1.txt</strong> para continuar</p>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".txt"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Verificar</button>
      </form>
    </div>
  );
}