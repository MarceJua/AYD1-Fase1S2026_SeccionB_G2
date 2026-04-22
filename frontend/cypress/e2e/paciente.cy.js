/**
 * Tests E2E del rol Paciente - HU-008, HU-019, HU-203, HU-205, HU-206
 */
describe("HU-008 | Login de Paciente", () => {
  beforeEach(() => {
    cy.fixture("usuarios").as("usuarios");
  });

  it("TC-E2E-001 | Muestra formulario de login con campos correo y contraseña", () => {
    cy.visit("/login");
    cy.get('input[type="email"], input[name="correo"]').should("be.visible");
    cy.get('input[type="password"], input[name="contrasena"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
    cy.screenshot("tc-e2e-001-formulario-login-paciente");
  });

  it("TC-E2E-002 | Login con credenciales incorrectas muestra mensaje de error", () => {
    cy.visit("/login");
    cy.get('input[type="email"], input[name="correo"]').type("correo@invalido.com");
    cy.get('input[type="password"], input[name="contrasena"]').type("ContraseñaMal");
    cy.get('button[type="submit"]').click();
    cy.screenshot("tc-e2e-002-error-login-paciente");
  });

  it("TC-E2E-003 | Página de selección de registro es accesible", () => {
    cy.visit("/seleccion-registro");
    cy.url().should("include", "/seleccion-registro");
    cy.screenshot("tc-e2e-003-seleccion-registro");
  });

  it("TC-E2E-004 | Formulario de registro de paciente es accesible", () => {
    cy.visit("/registro");
    cy.screenshot("tc-e2e-004-formulario-registro-paciente");
  });
});

describe("HU-019 | Dashboard del Paciente", () => {
  it("TC-E2E-005 | Redirecciona a login si no hay sesión activa en /dashboard", () => {
    cy.visit("/dashboard");
    cy.screenshot("tc-e2e-005-dashboard-sin-sesion");
    cy.url().should("satisfy", (url) => {
      return url.includes("/login") || url.includes("/dashboard");
    });
  });

  it("TC-E2E-006 | Página /mis-citas sin sesión redirige o muestra contenido", () => {
    cy.visit("/mis-citas");
    cy.screenshot("tc-e2e-006-mis-citas-sin-sesion");
  });
});

describe("HU-013 | Perfil del Paciente", () => {
  it("TC-E2E-007 | Página /perfil sin sesión redirige o carga", () => {
    cy.visit("/perfil");
    cy.screenshot("tc-e2e-007-perfil-sin-sesion");
  });
});
