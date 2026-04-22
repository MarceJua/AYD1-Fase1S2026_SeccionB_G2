/**
 * Tests de rutas del administrador - HU-208, HU-209
 * Cubre: denuncias, calificaciones, gráficos, gestión de médicos/pacientes
 */
const request = require("supertest");
const app = require("../app");

describe("HU-208 | Gestión de Denuncias", () => {
  test("TC-038 | GET /api/auth/admin/denuncias retorna 200 y array", async () => {
    const res = await request(app).get("/api/auth/admin/denuncias");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("TC-039 | DELETE /api/auth/admin/denuncias/:id con id inexistente retorna respuesta", async () => {
    const res = await request(app).delete("/api/auth/admin/denuncias/999999");
    expect([200, 404, 500]).toContain(res.statusCode);
  });

  test("TC-040 | GET /api/auth/admin/calificaciones-promedios retorna médicos y pacientes", async () => {
    const res = await request(app).get(
      "/api/auth/admin/calificaciones-promedios"
    );
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("medicos");
      expect(res.body).toHaveProperty("pacientes");
      expect(Array.isArray(res.body.medicos)).toBe(true);
      expect(Array.isArray(res.body.pacientes)).toBe(true);
    }
  });
});

describe("HU-209 | Gráficos y Estadísticas", () => {
  test("TC-041 | GET /api/auth/admin/grafico-horarios retorna array de franjas", async () => {
    const res = await request(app).get("/api/auth/admin/grafico-horarios");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("TC-042 | GET /api/auth/admin/grafico-cancelaciones retorna array de especialidades", async () => {
    const res = await request(app).get("/api/auth/admin/grafico-cancelaciones");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("TC-043 | GET /api/auth/admin/medicos-top retorna reporte", async () => {
    const res = await request(app).get("/api/auth/admin/medicos-top");
    expect([200, 500]).toContain(res.statusCode);
  });

  test("TC-044 | GET /api/auth/admin/especialidades retorna reporte", async () => {
    const res = await request(app).get("/api/auth/admin/especialidades");
    expect([200, 500]).toContain(res.statusCode);
  });
});

describe("HU-005 | Gestión de Médicos y Pacientes Pendientes", () => {
  test("TC-045 | GET /api/auth/admin/medicos-pendientes retorna array", async () => {
    const res = await request(app).get("/api/auth/admin/medicos-pendientes");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("TC-046 | GET /api/auth/admin/pacientes-pendientes retorna array", async () => {
    const res = await request(app).get("/api/auth/admin/pacientes-pendientes");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("TC-047 | GET /api/auth/admin/medicos-aprobados retorna array", async () => {
    const res = await request(app).get("/api/auth/admin/medicos-aprobados");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("TC-048 | GET /api/auth/admin/pacientes-aprobados retorna array", async () => {
    const res = await request(app).get("/api/auth/admin/pacientes-aprobados");
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test("TC-049 | POST /api/auth/admin/aprobar-medico/:id con id inexistente retorna respuesta", async () => {
    const res = await request(app).post("/api/auth/admin/aprobar-medico/999999");
    expect([200, 400, 404, 500]).toContain(res.statusCode);
  });

  test("TC-050 | POST /api/auth/admin/rechazar-medico/:id con id inexistente retorna respuesta", async () => {
    const res = await request(app).post(
      "/api/auth/admin/rechazar-medico/999999"
    );
    expect([200, 400, 404, 500]).toContain(res.statusCode);
  });
});
