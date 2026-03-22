// frontend/src/pages/PerfilMedico.jsx
// HU-013: Ver y Actualizar Perfil Médico
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getImageUrl(fotoPath) {
  if (!fotoPath) return null;
  const filename = fotoPath.split(/[\\/]/).pop();
  return `http://localhost:5000/uploads/${filename}`;
}

export default function PerfilMedico() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dpi: "",
    fecha_nacimiento: "",
    genero: "",
    direccion: "",
    telefono: "",
    numero_colegiado: "",
    especialidad: "",
    direccion_clinica: "",
    correo: "",
    foto: "",
  });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'exito'|'error', texto }

  // Cargar perfil al montar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login-medico");
      return;
    }

    fetch(`${API}/medico/perfil`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) {
          navigate("/login-medico");
          return;
        }
        const data = await r.json();
        const m = data.medico;
        setForm({
          nombre: m.nombre || "",
          apellido: m.apellido || "",
          dpi: m.dpi || "",
          fecha_nacimiento: m.fecha_nacimiento ? m.fecha_nacimiento.slice(0, 10) : "",
          genero: m.genero || "",
          direccion: m.direccion || "",
          telefono: m.telefono || "",
          numero_colegiado: m.numero_colegiado || "",
          especialidad: m.especialidad || "",
          direccion_clinica: m.direccion_clinica || "",
          correo: m.correo || "",
          foto: m.foto || "",
        });
        if (m.foto) {
          setFotoPreview(getImageUrl(m.foto));
        }
        setCargando(false);
      })
      .catch(() => {
        setMensaje({ tipo: "error", texto: "No se pudo cargar el perfil." });
        setCargando(false);
      });
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setGuardando(true);

    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("nombre", form.nombre);
    formData.append("apellido", form.apellido);
    formData.append("dpi", form.dpi);
    formData.append("fecha_nacimiento", form.fecha_nacimiento);
    formData.append("genero", form.genero);
    formData.append("direccion", form.direccion);
    formData.append("telefono", form.telefono);
    formData.append("numero_colegiado", form.numero_colegiado);
    formData.append("especialidad", form.especialidad);
    formData.append("direccion_clinica", form.direccion_clinica);
    // correo no se envía (no debe modificarse)

    if (fotoFile) {
      formData.append("foto", fotoFile);
    }

    try {
      const resp = await fetch(`${API}/medico/perfil`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await resp.json();

      if (resp.ok) {
        setMensaje({ tipo: "exito", texto: data.mensaje });
        // Actualizar foto en estado si cambió
        if (data.medico.foto) {
          setForm((prev) => ({ ...prev, foto: data.medico.foto }));
          if (!fotoFile) {
            setFotoPreview(getImageUrl(data.medico.foto));
          }
        }
        setFotoFile(null);
      } else {
        setMensaje({ tipo: "error", texto: data.error || "Error al actualizar el perfil." });
      }
    } catch {
      setMensaje({ tipo: "error", texto: "Error de conexion con el servidor." });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div style={styles.centrado}>
        <div style={styles.spinner}></div>
        <p style={{ color: "#94a3b8", marginTop: 12 }}>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div style={styles.pagina}>
      {/* Encabezado */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.titulo}>Mi Perfil</h1>
          <p style={styles.subtitulo}>Actualiza tu informacion personal y profesional</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/horario-medico")}
            style={styles.btnVolver}
          >
            Editar Horario Medico
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("usuario");
              navigate("/login-medico");
            }}
            style={styles.btnCerrarSesion}
          >
            Cerrar Sesion
          </button>
        </div>
      </div>

      {/* Tarjeta */}
      <div style={styles.card}>
        <form onSubmit={handleSubmit}>

          {/* Fotografia */}
          <section style={styles.seccion}>
            <h2 style={styles.seccionTitulo}>Fotografia</h2>
            <div style={styles.fotoRow}>
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="Foto de perfil"
                  style={styles.fotoImg}
                />
              ) : (
                <div style={styles.fotoPlaceholder}>Sin foto</div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  style={styles.btnCambiarFoto}
                >
                  Cambiar fotografia
                </button>
                {fotoFile && (
                  <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>
                    Archivo seleccionado: {fotoFile.name}
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </section>

          {/* Datos personales */}
          <section style={styles.seccion}>
            <h2 style={styles.seccionTitulo}>Datos Personales</h2>
            <div style={styles.grid2}>
              <Field label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
              <Field label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
              <Field label="DPI" name="dpi" value={form.dpi} onChange={handleChange} required maxLength={13} />
              <Field label="Fecha de Nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} required />
              <div>
                <label style={styles.label}>Genero</label>
                <select
                  name="genero"
                  value={form.genero}
                  onChange={handleChange}
                  required
                  style={styles.select}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <Field label="Telefono" name="telefono" value={form.telefono} onChange={handleChange} required maxLength={15} />
            </div>
            <div style={{ marginTop: 16 }}>
              <Field label="Direccion" name="direccion" value={form.direccion} onChange={handleChange} required />
            </div>
          </section>

          {/* Datos profesionales */}
          <section style={styles.seccion}>
            <h2 style={styles.seccionTitulo}>Datos Profesionales</h2>
            <div style={styles.grid2}>
              <Field label="Numero Colegiado" name="numero_colegiado" value={form.numero_colegiado} onChange={handleChange} required />
              <Field label="Especialidad" name="especialidad" value={form.especialidad} onChange={handleChange} required />
            </div>
            <div style={{ marginTop: 16 }}>
              <Field label="Direccion de Clinica" name="direccion_clinica" value={form.direccion_clinica} onChange={handleChange} required />
            </div>
          </section>

          {/* Correo (solo lectura) */}
          <section style={styles.seccion}>
            <h2 style={styles.seccionTitulo}>Acceso</h2>
            <div>
              <label style={styles.label}>Correo Electronico (no editable)</label>
              <input
                type="email"
                value={form.correo}
                disabled
                style={{ ...styles.input, ...styles.inputDisabled }}
              />
            </div>
          </section>

          {/* Mensajes */}
          {mensaje?.tipo === "exito" && (
            <div style={styles.alertExito}>{mensaje.texto}</div>
          )}
          {mensaje?.tipo === "error" && (
            <div style={styles.alertError}>{mensaje.texto}</div>
          )}

          {/* Boton guardar */}
          <button
            type="submit"
            disabled={guardando}
            style={{ ...styles.btnGuardar, ...(guardando ? styles.btnDisabled : {}) }}
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Componente auxiliar para inputs de texto
function Field({ label, name, value, onChange, type = "text", required, maxLength }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        style={styles.input}
      />
    </div>
  );
}

// Estilos
const styles = {
  pagina: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  centrado: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #334155",
    borderTop: "3px solid #38bdf8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    maxWidth: 720,
    width: "100%",
    gap: 16,
    flexWrap: "wrap",
  },
  titulo: {
    color: "#f1f5f9",
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  subtitulo: {
    color: "#94a3b8",
    fontSize: 14,
    margin: "4px 0 0",
  },
  btnVolver: {
    background: "rgba(148, 163, 184, 0.1)",
    border: "1px solid rgba(148,163,184,0.25)",
    color: "#cbd5e1",
    borderRadius: 10,
    padding: "8px 18px",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 500,
  },
  btnCerrarSesion: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239,68,68,0.4)",
    color: "#fca5a5",
    borderRadius: 10,
    padding: "8px 18px",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 500,
  },
  card: {
    background: "rgba(30, 41, 59, 0.9)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    borderRadius: 16,
    padding: "32px 36px",
    maxWidth: 720,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    backdropFilter: "blur(10px)",
  },
  seccion: {
    marginBottom: 32,
  },
  seccionTitulo: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: 600,
    margin: "0 0 16px",
    paddingBottom: 8,
    borderBottom: "1px solid rgba(148,163,184,0.15)",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148,163,184,0.25)",
    borderRadius: 10,
    color: "#f1f5f9",
    fontSize: 14,
    padding: "10px 14px",
    outline: "none",
    boxSizing: "border-box",
  },
  inputDisabled: {
    background: "rgba(15, 23, 42, 0.4)",
    color: "#64748b",
    cursor: "not-allowed",
    border: "1px solid rgba(148,163,184,0.1)",
  },
  select: {
    width: "100%",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(148,163,184,0.25)",
    borderRadius: 10,
    color: "#f1f5f9",
    fontSize: 14,
    padding: "10px 14px",
    outline: "none",
    boxSizing: "border-box",
    colorScheme: "dark",
  },
  fotoRow: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },
  fotoImg: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(56,189,248,0.4)",
  },
  fotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    background: "rgba(15, 23, 42, 0.8)",
    border: "2px dashed rgba(148,163,184,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
    fontSize: 12,
  },
  btnCambiarFoto: {
    background: "rgba(56,189,248,0.1)",
    border: "1px solid rgba(56,189,248,0.4)",
    color: "#38bdf8",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500,
  },
  alertExito: {
    background: "rgba(34, 197, 94, 0.1)",
    border: "1px solid rgba(34, 197, 94, 0.4)",
    borderRadius: 10,
    color: "#86efac",
    padding: "12px 16px",
    fontSize: 14,
    marginBottom: 20,
  },
  alertError: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    borderRadius: 10,
    color: "#fca5a5",
    padding: "12px 16px",
    fontSize: 14,
    marginBottom: 20,
  },
  btnGuardar: {
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #0284c7, #38bdf8)",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.5px",
    boxShadow: "0 4px 20px rgba(56,189,248,0.3)",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};
