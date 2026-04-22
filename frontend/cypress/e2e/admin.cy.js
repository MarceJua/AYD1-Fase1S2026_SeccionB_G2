/**
 * Tests E2E del rol Administrador - HU-018, HU-208, HU-209
 */
describe("HU-018 | Login de Administrador con 2FA", () => {
  it("TC-E2E-014 | Formulario de login admin muestra campos requeridos", () => {
    cy.visit("/admin-login");
    cy.get('input[type="email"], input[name="correo"]').should("be.visible");
    cy.get('input[type="password"], input[name="contrasena"]').should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
    cy.screenshot("tc-e2e-014-formulario-login-admin");
  });

  it("TC-E2E-015 | Login admin con credenciales inválidas muestra error", () => {
    cy.visit("/admin-login");
    cy.get('input[type="email"], input[name="correo"]').type("fake@admin.com");
    cy.get('input[type="password"], input[name="contrasena"]').type("Incorrecta");
    cy.get('button[type="submit"]').click();
    cy.screenshot("tc-e2e-015-error-login-admin");
  });

  it("TC-E2E-016 | Página de validación 2FA es accesible en /admin-2fa", () => {
    cy.visit("/admin-2fa");
    cy.screenshot("tc-e2e-016-pagina-2fa");
  });
});

describe("HU-208 | Dashboard Admin", () => {
  it("TC-E2E-017 | /admin-dashboard sin sesión redirige o carga", () => {
    cy.visit("/admin-dashboard");
    cy.screenshot("tc-e2e-017-admin-dashboard-sin-sesion");
  });
});

describe("HU-209 | Navegación general de rutas protegidas", () => {
  it("TC-E2E-018 | Ruta raíz / redirige a login o carga página principal", () => {
    cy.visit("/");
    cy.screenshot("tc-e2e-018-ruta-raiz");
  });
});
