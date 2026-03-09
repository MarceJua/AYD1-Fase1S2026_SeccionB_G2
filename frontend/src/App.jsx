import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importaciones directas desde la carpeta pages
import RegistroPaciente from "./pages/RegistroPaciente";
import LoginPaciente from "./pages/LoginPaciente";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas Públicas */}
        <Route path="/registro" element={<RegistroPaciente />} />
        <Route path="/login" element={<LoginPaciente />} />

        {/* Rutas Privadas (Sprint 2) */}
        <Route
          path="/dashboard"
          element={
            <h2 style={{ textAlign: "center", marginTop: "50px" }}>
              Bienvenido a SaludPlus 🏥
            </h2>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
