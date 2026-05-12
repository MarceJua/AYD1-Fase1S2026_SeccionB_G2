import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login_Register_Paciente.css";
import "../styles/DemoCenter.css";

const demoAccounts = [
  {
    key: "paciente",
    role: "Paciente",
    email: "paciente@demo.com",
    password: "demo123",
    color: "#0056b3",
    route: "/dashboard",
  },
  {
    key: "medico",
    role: "Médico",
    email: "medico@demo.com",
    password: "demo123",
    color: "#64748b",
    route: "/dashboard-medico",
  },
  {
    key: "admin",
    role: "Admin",
    email: "admin@demo.com",
    password: "demo123",
    color: "#0f172a",
    route: "/admin-dashboard",
  },
];

const DemoCenter = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState("");
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const iniciarDemo = async ({ key, email, password, route }) => {
    setActiveKey(key);
    setMensaje({ texto: "", tipo: "" });

    try {
      const endpoint =
        key === "admin"
          ? "/auth/admin/login"
          : key === "medico"
            ? "/auth/medico/login"
            : "/auth/paciente/login";

      const payload =
        key === "admin"
          ? { usuario: email, password }
          : { correo: email, password };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        payload,
      );

      if (response.data.requiere2FA) {
        setMensaje({
          texto: "El acceso demo del admin se completó con primer factor. Redirigiendo...",
          tipo: "success",
        });

        setTimeout(() => {
          navigate("/admin-2fa", {
            state: { tokenTemporal: response.data.tokenTemporal },
          });
        }, 800);
        return;
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));

      if (key === "admin") {
        localStorage.setItem("rol", "admin");
        setMensaje({ texto: "Acceso demo completado. Entrando al panel...", tipo: "success" });
        setTimeout(() => navigate(route), 900);
        return;
      }

      if (key === "medico") {
        try {
          const horarioRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/medico/horarios`,
            { headers: { Authorization: `Bearer ${response.data.token}` } },
          );

          const destino = horarioRes.data?.horario ? route : "/horario-medico";
          setMensaje({ texto: "Acceso demo completado. Entrando al portal...", tipo: "success" });
          setTimeout(() => navigate(destino), 900);
        } catch {
          setMensaje({ texto: "Acceso demo completado. Entrando al portal...", tipo: "success" });
          setTimeout(() => navigate("/horario-medico"), 900);
        }

        return;
      }

      setMensaje({ texto: "Acceso demo completado. Entrando al portal...", tipo: "success" });
      setTimeout(() => navigate(route), 900);
    } catch (error) {
      setMensaje({
        texto: error.response?.data?.error || "No fue posible iniciar el acceso demo.",
        tipo: "error",
      });
    } finally {
      setActiveKey("");
    }
  };

  return (
    <div className="auth-container demo-center-shell">
      <div className="auth-card demo-center-card">
        <div className="demo-center-hero">
          <p className="demo-center-kicker">Portfolio Demo</p>
          <h1 className="auth-logo demo-center-title">SaludPlus Demo Center</h1>
          <p className="auth-subtitle demo-center-subtitle">
            Accede a cada rol con un clic y recorre la experiencia sin registrarte.
          </p>
        </div>

        <div className="demo-center-grid">
          {demoAccounts.map((account) => (
            <button
              key={account.key}
              type="button"
              className="demo-center-card-button"
              onClick={() => iniciarDemo(account)}
              disabled={activeKey === account.key}
              style={{ borderColor: account.color }}
            >
              <span className="demo-center-card-button__role" style={{ color: account.color }}>
                {account.role}
              </span>
              <strong>{account.email}</strong>
              <small>demo123</small>
              <span className="demo-center-card-button__cta">
                {activeKey === account.key ? "Ingresando..." : "Entrar como demo"}
              </span>
            </button>
          ))}
        </div>

        {mensaje.texto && (
          <div className={`auth-message ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        <div className="demo-center-links">
          <Link to="/seleccion-registro">Ir a registro</Link>
          <Link to="/login">Login normal paciente</Link>
          <Link to="/login-medico">Login normal médico</Link>
        </div>
      </div>
    </div>
  );
};

export default DemoCenter;
