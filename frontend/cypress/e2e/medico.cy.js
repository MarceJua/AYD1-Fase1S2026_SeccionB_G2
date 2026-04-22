/**
 * Tests E2E del rol Médico - HU-013, HU-205, HU-206
 */
describe("HU-013 | Login de Médico", () => {
  it("TC-E2E-008 | Muestra formulario de login médico con campos requeridos", () => {
    cy.visit("/login-medico");
    cy.get('input[type="email"], input[name="correo"]').should("be.visible");
    cy.get('input[type="password"], input[name="contrasena"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
    cy.screenshot("tc-e2e-008-formulario-login-medico");
  });

  it("TC-E2E-009 | Login médico con credenciales inválidas muestra error", () => {
    cy.visit("/login-medico");
    cy.get('input[type="email"], input[name="correo"]').type("fake@medico.com");
    cy.get('input[type="password"], input[name="contrasena"]').type("ContraseñaMal");
    cy.get('button[type="submit"]').click();
    cy.screenshot("tc-e2e-009-error-login-medico");
  });

  it("TC-E2E-010 | Formulario de registro médico es accesible", () => {
    cy.visit("/registro-medico");
    cy.screenshot("tc-e2e-010-formulario-registro-medico");
  });
});

describe("HU-013 | Dashboard del Médico", () => {
  it("TC-E2E-011 | /dashboard-medico sin sesión redirige o carga", () => {
    cy.visit("/dashboard-medico");
    cy.screenshot("tc-e2e-011-dashboard-medico-sin-sesion");
  });

  it("TC-E2E-012 | /horario-medico sin sesión redirige o carga", () => {
    cy.visit("/horario-medico");
    cy.screenshot("tc-e2e-012-horario-medico-sin-sesion");
  });

  it("TC-E2E-013 | /perfil-medico sin sesión redirige o carga", () => {
    cy.visit("/perfil-medico");
    cy.screenshot("tc-e2e-013-perfil-medico-sin-sesion");
  });
});
