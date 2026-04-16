import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login_Register_Paciente.css";

const RegistroPaciente = () => {
  const navigate = useNavigate();
  // 1. Agregar todos los campos obligatorios según la base de datos
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dpi: "",
    genero: "",
    direccion: "",
    telefono: "",
    fecha_nacimiento: "",
    correo: "",
    password: "",
  });

  // 2. Estado para la foto opcional
  const [foto, setFoto] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [pdfDpi, setPdfDpi] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // La foto es obligatoria para pacientes y el dpi, solo la mandamos si la subió
    if (!foto) {
      setMensaje({ texto: "Debe subir una fotografía", tipo: "error" });
      return;
    }

    if (!pdfDpi) {
      setMensaje({ texto: "Debe subir su DPI en PDF", tipo: "error" });
      return;
    }

    // 3. Crear el FormData en lugar de mandar JSON
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    data.append("foto", foto);
    data.append("dpi_pdf", pdfDpi);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/paciente/registro`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }, // Importante para enviar archivos
      );

      setMensaje({ texto: "" + response.data.mensaje, tipo: "success" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMensaje({
        texto: error.response?.data?.error || "Error al registrar",
        tipo: "error",
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <h1 className="auth-logo">SaludPlus</h1>
        <p className="auth-subtitle">Crea tu cuenta como paciente</p>

        {mensaje.texto && (
          <div className={`auth-message ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <input
              className="auth-input"
              type="text"
              name="nombre"
              placeholder="Nombre"
              required
              onChange={handleChange}
            />
            <input
              className="auth-input"
              type="text"
              name="apellido"
              placeholder="Apellido"
              required
              onChange={handleChange}
            />
            <input
              className="auth-input"
              type="text"
              name="dpi"
              placeholder="DPI (13 dígitos)"
              required
              maxLength="13"
              onChange={handleChange}
            />
            <input
              className="auth-input"
              type="date"
              name="fecha_nacimiento"
              required
              onChange={handleChange}
            />

            <select
              className="auth-input"
              name="genero"
              onChange={handleChange}
              required
            >
              <option value="">Género...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>

            <input
              className="auth-input"
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              required
              onChange={handleChange}
            />
            <input
              className="auth-input full-width"
              type="text"
              name="direccion"
              placeholder="Dirección exacta"
              required
              onChange={handleChange}
            />
            <input
              className="auth-input full-width"
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              required
              onChange={handleChange}
            />
            <input
              className="auth-input full-width"
              type="password"
              name="password"
              placeholder="Contraseña segura"
              required
              onChange={handleChange}
            />

            <div className="auth-input full-width">
              <label style={{ fontSize: "12px", color: "#666" }}>
                Fotografía (Obligatoria):
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                required
              />
            </div>
          </div>

          <div className="auth-input full-width">
            <label style={{ fontSize: "12px", color: "#666" }}>
              DPI en PDF (Obligatorio):
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfDpi(e.target.files[0])}
              required
            />
          </div>

          <button
            className="auth-button"
            type="submit"
            style={{ marginTop: "15px" }}
          >
            Registrarme
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default RegistroPaciente;
