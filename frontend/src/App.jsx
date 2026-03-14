import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importaciones directas desde la carpeta pages
import RegistroPaciente from "./pages/RegistroPaciente";
import LoginPaciente from "./pages/LoginPaciente";
import LoginMedico from "./pages/LoginMedico";
import RegistroMedico from './pages/RegistroMedico';
import SeleccionRol from './pages/SeleccionRol';
import LoginAdmin from './pages/LoginAdmin';
import Admin2FA from './pages/Admin2FA';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginPaciente />} />
        <Route path="/login-medico" element={<LoginMedico />} />
        <Route path="/admin-login" element={<LoginAdmin />} />
        <Route path="/admin-2fa" element={<Admin2FA />} />
        <Route path="/seleccion-registro" element={<SeleccionRol />} />
        <Route path="/registro" element={<RegistroPaciente />} />
        <Route path="/registro-medico" element={<RegistroMedico />} />

        {/* Rutas Privadas (Sprint 2) */}
        <Route
          path="/dashboard"
          element={
            <h2 style={{ textAlign: "center", marginTop: "50px" }}>
              Bienvenido a SaludPlus 
            </h2>
          }
        />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;