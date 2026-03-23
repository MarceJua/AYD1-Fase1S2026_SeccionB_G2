import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import "../styles/AdminDashboard.css";

Chart.defaults.color = "#ffffff";
Chart.defaults.borderColor = "rgba(255, 255, 255, 0.1)";

const AdminDashboard = () => {
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [medicosAprobados, setMedicosAprobados] = useState([]);
  const [pacientesAprobados, setPacientesAprobados] = useState([]);
  const [reporteMedicos, setReporteMedicos] = useState([]);
  const [reporteEspecialidades, setReporteEspecialidades] = useState([]);
  const navigate = useNavigate();

  // Declarar funciones ARRIBA del useEffect
  const fetchPendientes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin-login");
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Obtener Médicos
      const resMedicos = await fetch(
        "http://localhost:5000/api/auth/admin/medicos-pendientes",
        config,
      );
      if (resMedicos.ok) setMedicos(await resMedicos.json());

      // Obtener Pacientes
      const resPacientes = await fetch(
        "http://localhost:5000/api/auth/admin/pacientes-pendientes",
        config,
      );
      if (resPacientes.ok) setPacientes(await resPacientes.json());

      const resMedAprobados = await fetch(
        "http://localhost:5000/api/auth/admin/medicos-aprobados",
        config,
      );
      if (resMedAprobados.ok) setMedicosAprobados(await resMedAprobados.json());

      const resPacAprobados = await fetch(
        "http://localhost:5000/api/auth/admin/pacientes-aprobados",
        config,
      );
      if (resPacAprobados.ok)
        setPacientesAprobados(await resPacAprobados.json());
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  const fetchReportes = async () => {
    try {
      const token = localStorage.getItem("token");

      const resMedicos = await fetch(
        "http://localhost:5000/api/auth/admin/medicos-top",
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const resEspecialidades = await fetch(
        "http://localhost:5000/api/auth/admin/especialidades",
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (resMedicos.ok) setReporteMedicos(await resMedicos.json());
      if (resEspecialidades.ok)
        setReporteEspecialidades(await resEspecialidades.json());
    } catch (error) {
      console.error("Error cargando reportes:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPendientes();
    fetchReportes();
  }, []);

  useEffect(() => {
    if (reporteMedicos.length === 0) return;

    const ctx = document.getElementById("graficoMedicos");

    const chartExistente = Chart.getChart(ctx);
    if (chartExistente) {
      chartExistente.destroy();
    }

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: reporteMedicos.map((m) => m.nombre),
        datasets: [
          {
            label: "Citas atendidas",
            data: reporteMedicos.map((m) => m.total_citas),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          },
        },
      },
    });
  }, [reporteMedicos]);

  useEffect(() => {
    if (reporteEspecialidades.length === 0) return;

    const ctx = document.getElementById("graficoEspecialidades");

    const chartExistente = Chart.getChart(ctx);
    if (chartExistente) {
      chartExistente.destroy();
    }

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: reporteEspecialidades.map((e) => e.especialidad),
        datasets: [
          {
            label: "Especialidades solicitadas",
            data: reporteEspecialidades.map((e) => e.total),
            backgroundColor: [
              "#36A2EB",
              "#FF6384",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }, [reporteEspecialidades]);

  const handleDarDeBaja = async (tipo, id) => {
    if (
      !window.confirm(
        `¿Estás súper seguro de dar de BAJA a este ${tipo}? Ya no podrá iniciar sesión.`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/auth/admin/baja-${tipo}/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setMensaje(
          `⚠️ ${tipo === "medico" ? "Médico" : "Paciente"} dado de baja`,
        );
        if (tipo === "medico") {
          setMedicosAprobados(medicosAprobados.filter((m) => m.id !== id));
        } else {
          setPacientesAprobados(pacientesAprobados.filter((p) => p.id !== id));
        }
      }
    } catch (error) {
      console.error("Error al dar de baja:", error);
    }
  };

  const handleAccion = async (tipo, accion, id) => {
    if (
      !window.confirm(
        `¿Estás seguro de ${accion.toUpperCase()} a este ${tipo}?`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/auth/admin/${accion}-${tipo}/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setMensaje(
          ` ${tipo === "medico" ? "Médico" : "Paciente"} ${accion}do exitosamente`,
        );
        if (tipo === "medico") {
          setMedicos(medicos.filter((m) => m.id !== id));
        } else {
          setPacientes(pacientes.filter((p) => p.id !== id));
        }
      }
    } catch (error) {
      console.error(`Error al ${accion}:`, error);
    }
  };

  // Función auxiliar para construir la ruta de la imagen
  const getImageUrl = (rutaFoto) => {
    if (!rutaFoto) return "https://via.placeholder.com/50";

    // Extraemos solo el nombre del archivo (ignorando carpetas y diagonales)
    const nombreArchivo = rutaFoto.split("\\").pop().split("/").pop();

    return `http://localhost:5000/uploads/${nombreArchivo}`;
  };
  

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2> Panel de Administración - SaludPlus</h2>
        <button
          className="btn-logout"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/admin-login");
          }}
        >
          Cerrar Sesión
        </button>
      </div>
      {mensaje && (
        <div
          style={{
            padding: "10px",
            backgroundColor: "#d4edda",
            color: "#155724",
            marginBottom: "20px",
            borderRadius: "5px",
          }}
        >
          {mensaje}
        </div>
      )}
      {/* SECCIÓN DE MÉDICOS */}
      <h3>📋 Médicos Pendientes de Aprobación</h3>
      {medicos.length === 0 ? (
        <p>No hay médicos pendientes.</p>
      ) : (
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
            {medicos.map((medico) => (
              <tr key={medico.id}>
                <td>
                  <img
                    src={getImageUrl(medico.foto)}
                    alt="Perfil"
                    className="foto-perfil"
                  />
                </td>
                <td>
                  {medico.nombre} {medico.apellido}
                </td>
                <td>{medico.dpi}</td>
                <td>{medico.genero}</td>
                <td>{medico.numero_colegiado}</td>
                <td>{medico.especialidad}</td>
                <td>{medico.correo}</td>
                <td>
                  <button
                    className="btn-aprobar"
                    onClick={() => handleAccion("medico", "aprobar", medico.id)}
                  >
                    Aceptar
                  </button>
                  <button
                    className="btn-rechazar"
                    onClick={() =>
                      handleAccion("medico", "rechazar", medico.id)
                    }
                  >
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* SECCIÓN DE PACIENTES */}
      <h3>📋 Pacientes Pendientes de Aprobación</h3>
      {pacientes.length === 0 ? (
        <p>No hay pacientes pendientes.</p>
      ) : (
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
            {pacientes.map((paciente) => (
              <tr key={paciente.id}>
                {/* Si no tiene foto, getImageUrl devuelve un placeholder por defecto */}
                <td>
                  <img
                    src={getImageUrl(paciente.foto)}
                    alt="Perfil"
                    className="foto-perfil"
                  />
                </td>
                <td>
                  {paciente.nombre} {paciente.apellido}
                </td>
                <td>{paciente.dpi}</td>
                <td>{paciente.genero}</td>
                <td>{paciente.correo}</td>
                <td>
                  <button
                    className="btn-aprobar"
                    onClick={() =>
                      handleAccion("paciente", "aprobar", paciente.id)
                    }
                  >
                    Aceptar
                  </button>
                  <button
                    className="btn-rechazar"
                    onClick={() =>
                      handleAccion("paciente", "rechazar", paciente.id)
                    }
                  >
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <hr style={{ margin: "40px 0", border: "1px solid #ccc" }} />
      <h2 style={{ color: "#0056b3" }}>🟢 Usuarios Activos en el Sistema</h2>
      {/* TABLA DE MÉDICOS APROBADOS */}
      <h3>Médicos Activos</h3>
      {medicosAprobados.length === 0 ? (
        <p>No hay médicos activos.</p>
      ) : (
        <table className="admin-table">
          {/* Mismos <thead> que la otra tabla */}
          <tbody>
            {medicosAprobados.map((medico) => (
              <tr key={medico.id}>
                <td>
                  <img
                    src={getImageUrl(medico.foto)}
                    alt="Perfil"
                    className="foto-perfil"
                  />
                </td>
                <td>
                  {medico.nombre} {medico.apellido}
                </td>
                <td>{medico.dpi}</td>
                <td>{medico.genero}</td>
                <td>{medico.numero_colegiado}</td>
                <td>{medico.especialidad}</td>
                <td>{medico.correo}</td>
                <td>
                  <button
                    className="btn-rechazar"
                    onClick={() => handleDarDeBaja("medico", medico.id)}
                  >
                    Dar de Baja
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* TABLA DE PACIENTES APROBADOS */}
      <h3>Pacientes Activos</h3>
      {pacientesAprobados.length === 0 ? (
        <p>No hay pacientes activos.</p>
      ) : (
        <table className="admin-table">
          {/* Mismos <thead> que la otra tabla */}
          <tbody>
            {pacientesAprobados.map((paciente) => (
              <tr key={paciente.id}>
                <td>
                  <img
                    src={getImageUrl(paciente.foto)}
                    alt="Perfil"
                    className="foto-perfil"
                  />
                </td>
                <td>
                  {paciente.nombre} {paciente.apellido}
                </td>
                <td>{paciente.dpi}</td>
                <td>{paciente.genero}</td>
                <td>{paciente.correo}</td>
                <td>
                  <button
                    className="btn-rechazar"
                    onClick={() => handleDarDeBaja("paciente", paciente.id)}
                  >
                    Dar de Baja
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <hr style={{ margin: "40px 0", border: "1px solid #ccc" }} />
      <h2 style={{ color: "#0056b3" }}>📊 Reportes Analíticos del Sistema</h2>
      <div className="reportes-container">
        <div className="reporte">
          <h3>Médicos con más citas atendidas</h3>
          <canvas id="graficoMedicos"></canvas>
        </div>

        <div className="reporte">
          <h3>Especialidades más solicitadas</h3>
          <canvas id="graficoEspecialidades"></canvas>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
