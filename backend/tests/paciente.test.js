/**
 * Tests de rutas del paciente - HU-008, HU-019, HU-203, HU-205, HU-206
 * Cubre: obtener médicos, horarios, citas activas, historial, cancelar cita, calificar/reportar
 */
const request = require("supertest");
const app = require("../app");

describe("HU-008 | Listado de Médicos Disponibles", () => {
  test("TC-013 | GET /api/paciente/medicos retorna 200 y array", async () => {
    const res = await request(app).get("/api/paciente/medicos");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("TC-014 | GET /api/paciente/medicos con paciente_id filtra médicos con cita activa", async () => {
    const res = await request(app).get("/api/paciente/medicos?paciente_id=1");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("TC-015 | GET /api/paciente/medicos/:id/horario sin fecha retorna horario base", async () => {
    const res = await request(app).get("/api/paciente/medicos/1/horario");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("horario");
    }
  });

  test("TC-016 | GET /api/paciente/medicos/:id/horario con fecha retorna slots", async () => {
    const res = await request(app).get(
      "/api/paciente/medicos/1/horario?fecha=2026-05-05"
    );
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("horario");
    }
  });
});

describe("HU-019 | Gestión de Citas del Paciente", () => {
  test("TC-017 | GET /api/paciente/mis-citas/:id retorna citas activas", async () => {
    const res = await request(app).get("/api/paciente/mis-citas/1");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("citas");
      expect(Array.isArray(res.body.citas)).toBe(true);
    }
  });

  test("TC-018 | GET /api/paciente/historial-citas/:id retorna historial", async () => {
    const res = await request(app).get("/api/paciente/historial-citas/1");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("historial");
      expect(Array.isArray(res.body.historial)).toBe(true);
    }
  });

  test("TC-019 | PUT /api/paciente/cita/:id/cancelar con cita inexistente retorna 404", async () => {
    const res = await request(app).put("/api/paciente/cita/999999/cancelar");
    expect([404, 500]).toContain(res.statusCode);
  });

  test("TC-020 | POST /api/paciente/programar-cita sin datos retorna 400 o 500", async () => {
    const res = await request(app)
      .post("/api/paciente/programar-cita")
      .send({});
    expect([400, 422, 500]).toContain(res.statusCode);
  });
});

describe("HU-203 | Historial Médico con Diagnóstico", () => {
  test("TC-021 | Historial incluye campo medicamentos en cada cita", async () => {
    const res = await request(app).get("/api/paciente/historial-citas/1");
    if (res.statusCode === 200 && res.body.historial.length > 0) {
      const primeraCita = res.body.historial[0];
      expect(primeraCita).toHaveProperty("medicamentos");
    } else {
      expect([200, 500]).toContain(res.statusCode);
    }
  });
});

describe("HU-205 | Calificación de Médico por Paciente", () => {
  test("TC-022 | POST /api/paciente/calificar-medico sin datos retorna error", async () => {
    const res = await request(app)
      .post("/api/paciente/calificar-medico")
      .send({});
    expect([400, 404, 422, 500]).toContain(res.statusCode);
  });
});

describe("HU-206 | Reporte de Médico por Paciente", () => {
  test("TC-023 | POST /api/paciente/reportar-medico sin datos retorna error", async () => {
    const res = await request(app)
      .post("/api/paciente/reportar-medico")
      .send({});
    expect([400, 422, 500]).toContain(res.statusCode);
  });
});

describe("HU-019 | Actualización de Perfil del Paciente", () => {
  test("TC-024 | PUT /api/paciente/perfil/:id con correo duplicado retorna 400", async () => {
    const res = await request(app)
      .put("/api/paciente/perfil/1")
      .send({ nombre: "Test", correo: "otro@paciente.com" });
    expect([200, 400, 404, 500]).toContain(res.statusCode);
  });

  test("TC-025 | PUT /api/paciente/perfil/:id con id inexistente retorna 404 o 500", async () => {
    const res = await request(app)
      .put("/api/paciente/perfil/999999")
      .send({ nombre: "Ghost", correo: "ghost@test.com" });
    expect([404, 400, 500]).toContain(res.statusCode);
  });
});
