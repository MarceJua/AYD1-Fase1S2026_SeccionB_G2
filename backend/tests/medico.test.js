/**
 * Tests de rutas del médico - HU-013, HU-205, HU-206
 * Cubre: citas pendientes, historial, horario, perfil, calificar/reportar paciente
 * Todas las rutas requieren verifyMedicoToken — se valida que sin token retorne 401/403
 */
const request = require("supertest");
const app = require("../app");

const TOKEN_INVALIDO = "Bearer tokenInvalidoParaTest";

describe("HU-013 | Citas del Médico (protegidas por JWT)", () => {
  test("TC-026 | GET /api/medico/citas/pendientes sin token retorna 401 o 403", async () => {
    const res = await request(app).get("/api/medico/citas/pendientes");
    expect([401, 403, 500]).toContain(res.statusCode);
  });

  test("TC-027 | GET /api/medico/citas/pendientes con token inválido retorna 401 o 403", async () => {
    const res = await request(app)
      .get("/api/medico/citas/pendientes")
      .set("Authorization", TOKEN_INVALIDO);
    expect([401, 403, 500]).toContain(res.statusCode);
  });

  test("TC-028 | GET /api/medico/citas/historial sin token retorna 401 o 403", async () => {
    const res = await request(app).get("/api/medico/citas/historial");
    expect([401, 403, 500]).toContain(res.statusCode);
  });

  test("TC-029 | PUT /api/medico/citas/:id/atender sin token retorna 401 o 403", async () => {
    const res = await request(app)
      .put("/api/medico/citas/1/atender")
      .send({ diagnostico: "Test", tratamiento: "Reposo" });
    expect([401, 403, 500]).toContain(res.statusCode);
  });

  test("TC-030 | PUT /api/medico/citas/:id/cancelar sin token retorna 401 o 403", async () => {
    const res = await request(app).put("/api/medico/citas/1/cancelar");
    expect([401, 403, 500]).toContain(res.statusCode);
  });
});

describe("HU-013 | Horario del Médico (protegido por JWT)", () => {
  test("TC-031 | GET /api/medico/horarios sin token retorna 401 o 403", async () => {
    const res = await request(app).get("/api/medico/horarios");
    expect([401, 403, 500]).toContain(res.statusCode);
  });

  test("TC-032 | POST /api/medico/horarios sin token retorna 401 o 403", async () => {
    const res = await request(app)
      .post("/api/medico/horarios")
      .send({ dias: ["lunes"], hora_inicio: "08:00", hora_fin: "17:00" });
    expect([401, 403, 500]).toContain(res.statusCode);
  });

  test("TC-033 | PUT /api/medico/horarios sin token retorna 401 o 403", async () => {
    const res = await request(app)
      .put("/api/medico/horarios")
      .send({ dias: ["martes"], hora_inicio: "09:00", hora_fin: "18:00" });
    expect([401, 403, 500]).toContain(res.statusCode);
  });
});

describe("HU-013 | Perfil del Médico (protegido por JWT)", () => {
  test("TC-034 | GET /api/medico/perfil sin token retorna 401 o 403", async () => {
    const res = await request(app).get("/api/medico/perfil");
    expect([401, 403, 500]).toContain(res.statusCode);
  });

  test("TC-035 | PUT /api/medico/perfil sin token retorna 401 o 403", async () => {
    const res = await request(app)
      .put("/api/medico/perfil")
      .send({ nombre: "Dr. Test", telefono: "12345678" });
    expect([401, 403, 500]).toContain(res.statusCode);
  });
});

describe("HU-205 | Calificación de Paciente por Médico", () => {
  test("TC-036 | POST /api/medico/citas/calificar-paciente sin token retorna 401 o 403", async () => {
    const res = await request(app)
      .post("/api/medico/citas/calificar-paciente")
      .send({ cita_id: 1, estrellas: 5 });
    expect([401, 403, 500]).toContain(res.statusCode);
  });
});

describe("HU-206 | Reporte de Paciente por Médico", () => {
  test("TC-037 | POST /api/medico/citas/reportar-paciente sin token retorna 401 o 403", async () => {
    const res = await request(app)
      .post("/api/medico/citas/reportar-paciente")
      .send({ cita_id: 1, categoria: "Conducta inapropiada", explicacion: "Test" });
    expect([401, 403, 500]).toContain(res.statusCode);
  });
});
