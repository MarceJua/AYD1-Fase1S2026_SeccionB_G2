// Comando reutilizable: login paciente via UI
Cypress.Commands.add("loginPaciente", (correo, contrasena) => {
  cy.visit("/login");
  cy.get('input[type="email"], input[name="correo"]').type(correo);
  cy.get('input[type="password"], input[name="contrasena"]').type(contrasena);
  cy.get('button[type="submit"]').click();
});

// Comando reutilizable: login médico via UI
Cypress.Commands.add("loginMedico", (correo, contrasena) => {
  cy.visit("/login-medico");
  cy.get('input[type="email"], input[name="correo"]').type(correo);
  cy.get('input[type="password"], input[name="contrasena"]').type(contrasena);
  cy.get('button[type="submit"]').click();
});

// Comando reutilizable: login admin primer factor via UI
Cypress.Commands.add("loginAdmin", (correo, contrasena) => {
  cy.visit("/admin-login");
  cy.get('input[type="email"], input[name="correo"]').type(correo);
  cy.get('input[type="password"], input[name="contrasena"]').type(contrasena);
  cy.get('button[type="submit"]').click();
});
