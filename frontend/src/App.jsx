import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importaciones directas desde la carpeta pages
import RegistroPaciente from "./pages/RegistroPaciente";
import LoginPaciente from "./pages/LoginPaciente";
import LoginMedico from "./pages/LoginMedico";
import RegistroMedico from "./pages/RegistroMedico";
import SeleccionRol from "./pages/SeleccionRol";
import LoginAdmin from "./pages/LoginAdmin";
import Admin2FA from "./pages/Admin2FA";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardPaciente from "./pages/DashboardPaciente";
import PerfilPaciente from "./pages/PerfilPaciente";
import HorarioMedico from "./pages/HorarioMedico"; // HU-009
import PerfilMedico from "./pages/PerfilMedico"; // HU-013
import DashboardMedico from "./pages/DashboardMedico";
import MisCitas from "./pages/MisCitas";

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
        <Route path="/dashboard" element={<DashboardPaciente />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard-medico" element={<DashboardMedico />} />
        <Route path="/perfil" element={<PerfilPaciente />} />
        <Route path="/horario-medico" element={<HorarioMedico />} />{" "}
        {/* HU-009 */}
        <Route path="/perfil-medico" element={<PerfilMedico />} />{" "}
        {/* HU-013 */}
        <Route path="/mis-citas" element={<MisCitas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
