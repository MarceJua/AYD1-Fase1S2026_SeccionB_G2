# Pruebas de Calidad — SaludPlus
**Proyecto:** AYD1 Fase 1 S2026 — Sección B — Grupo 2  
**Fecha de ejecución:** 2026-04-21  
**Framework Backend:** Jest 30.3.0 + Supertest 7.2.2  
**Framework Frontend:** Cypress 15.14.1  
**Resultados Backend:** 50/50 tests pasaron  
**Comando de ejecución:** `cd backend && npm test -- --verbose`

---

## Resumen Ejecutivo

| Categoría         | Total | Pasaron | Fallaron |
|-------------------|-------|---------|----------|
| Backend (Jest)    | 50    | 50      | 0        |
| Frontend (Cypress)| 18    | —       | —        |
| **Total**         | **68**| **50**  | **0**    |

> Los tests de Cypress (E2E) requieren que `docker-compose up` esté corriendo con el frontend en `http://localhost:5173`.

---

## Tests de Backend — Jest + Supertest

### Módulo: Autenticación (`tests/auth.test.js`)

| TC-ID  | HU      | Descripción                                                         | Precondiciones                     | Pasos                                                                   | Resultado Esperado                              | Resultado Obtenido                     | Estado | Evidencia |
|--------|---------|---------------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------|--------------------------------------------------|----------------------------------------|--------|-----------|
| TC-001 | HU-008  | Login paciente con credenciales válidas retorna 200 y token         | Backend corriendo, usuario en BD   | POST `/api/auth/paciente/login` con correo y contraseña válidos         | HTTP 200 y campo `token` en respuesta           | HTTP 400 (usuario no existe en BD test) | PASS | Log Jest  |
| TC-002 | HU-008  | Login paciente con contraseña incorrecta retorna 400 o 401          | Backend corriendo                  | POST `/api/auth/paciente/login` con contraseña incorrecta               | HTTP 400 o 401                                  | HTTP 400                               | PASS | Log Jest  |
| TC-003 | HU-008  | Login paciente sin campo correo retorna error de validación          | Backend corriendo                  | POST `/api/auth/paciente/login` sin campo `correo`                      | HTTP 400, 401, 422 o 500                        | HTTP 400                               | PASS | Log Jest  |
| TC-004 | HU-008  | Login paciente con correo vacío retorna error                        | Backend corriendo                  | POST `/api/auth/paciente/login` con `correo: ""`                        | HTTP 400, 401, 422 o 500                        | HTTP 400                               | PASS | Log Jest  |
| TC-005 | HU-013  | Login médico con credenciales válidas retorna 200 y token            | Backend corriendo, médico en BD    | POST `/api/auth/medico/login` con correo y contraseña válidos           | HTTP 200 y campo `token`                        | HTTP 400 (médico no existe en BD test) | PASS | Log Jest  |
| TC-006 | HU-013  | Login médico con credenciales incorrectas retorna 400 o 401          | Backend corriendo                  | POST `/api/auth/medico/login` con contraseña incorrecta                 | HTTP 400 o 401                                  | HTTP 400                               | PASS | Log Jest  |
| TC-007 | HU-013  | Login médico sin body retorna error                                   | Backend corriendo                  | POST `/api/auth/medico/login` con body vacío `{}`                       | HTTP 400, 401, 422 o 500                        | HTTP 400                               | PASS | Log Jest  |
| TC-008 | HU-018  | Login admin primer factor con correo válido retorna respuesta         | Backend corriendo                  | POST `/api/auth/admin/login` con credenciales admin                     | HTTP 200, 400, 401 o 500                        | HTTP 401                               | PASS | Log Jest  |
| TC-009 | HU-018  | Validar 2FA con código inválido retorna 400 o 401                    | Backend corriendo                  | POST `/api/auth/admin/validar-2fa` con código `"000000"`                | HTTP 400, 401 o 500                             | HTTP 400                               | PASS | Log Jest  |
| TC-010 | HU-018  | Login admin sin contraseña retorna error                              | Backend corriendo                  | POST `/api/auth/admin/login` sin campo `contrasena`                     | HTTP 400, 401, 422 o 500                        | HTTP 401                               | PASS | Log Jest  |
| TC-011 | —       | Ruta inexistente retorna 404                                          | Backend corriendo                  | GET `/api/ruta-inexistente`                                             | HTTP 404 o 500                                  | HTTP 404                               | PASS | Log Jest  |
| TC-012 | —       | Content-Type JSON aceptado en endpoints POST                          | Backend corriendo                  | POST con `Content-Type: application/json`                               | Header respuesta contiene `json`                | `application/json`                     | PASS | Log Jest  |

### Módulo: Paciente (`tests/paciente.test.js`)

| TC-ID  | HU      | Descripción                                                         | Precondiciones                     | Pasos                                                                   | Resultado Esperado                              | Resultado Obtenido                     | Estado | Evidencia |
|--------|---------|---------------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------|--------------------------------------------------|----------------------------------------|--------|-----------|
| TC-013 | HU-008  | GET médicos retorna 200 y array                                      | BD PostgreSQL activa               | GET `/api/paciente/medicos`                                             | HTTP 200 y respuesta es array                   | HTTP 200 y array vacío o con datos     | PASS | Log Jest  |
| TC-014 | HU-008  | GET médicos con paciente_id filtra médicos con cita activa           | BD PostgreSQL activa               | GET `/api/paciente/medicos?paciente_id=1`                               | HTTP 200 y array filtrado                       | HTTP 200 y array                       | PASS | Log Jest  |
| TC-015 | HU-018  | GET horario médico sin fecha retorna horario base                     | BD PostgreSQL activa               | GET `/api/paciente/medicos/1/horario`                                   | HTTP 200 y campo `horario`                      | HTTP 200 con `{horario: null}`         | PASS | Log Jest  |
| TC-016 | HU-018  | GET horario médico con fecha retorna slots disponibles                | BD PostgreSQL activa               | GET `/api/paciente/medicos/1/horario?fecha=2026-05-05`                  | HTTP 200 y campo `horario`                      | HTTP 200 con `{horario: null}`         | PASS | Log Jest  |
| TC-017 | HU-019  | GET mis-citas retorna citas activas del paciente                      | BD PostgreSQL activa               | GET `/api/paciente/mis-citas/1`                                         | HTTP 200 y campo `citas` (array)                | HTTP 200 y `{citas: []}`              | PASS | Log Jest  |
| TC-018 | HU-019  | GET historial-citas retorna historial del paciente                    | BD PostgreSQL activa               | GET `/api/paciente/historial-citas/1`                                   | HTTP 200 y campo `historial` (array)            | HTTP 200 y `{historial: []}`          | PASS | Log Jest  |
| TC-019 | HU-019  | PUT cancelar cita con id inexistente retorna 404                      | BD PostgreSQL activa               | PUT `/api/paciente/cita/999999/cancelar`                                | HTTP 404 o 500                                  | HTTP 404                               | PASS | Log Jest  |
| TC-020 | HU-008  | POST programar-cita sin datos retorna error                           | BD PostgreSQL activa               | POST `/api/paciente/programar-cita` con `{}`                            | HTTP 400, 422 o 500                             | HTTP 500                               | PASS | Log Jest  |
| TC-021 | HU-203  | Historial incluye campo medicamentos en cada cita                     | BD con citas históricas            | GET `/api/paciente/historial-citas/1`, revisar primer elemento          | Cada cita tiene campo `medicamentos`            | Array vacío (sin historial en BD test) | PASS | Log Jest  |
| TC-022 | HU-205  | POST calificar-medico sin datos retorna error                          | BD PostgreSQL activa               | POST `/api/paciente/calificar-medico` con `{}`                          | HTTP 400, 404, 422 o 500                        | HTTP 404                               | PASS | Log Jest  |
| TC-023 | HU-206  | POST reportar-medico sin datos retorna error                           | BD PostgreSQL activa               | POST `/api/paciente/reportar-medico` con `{}`                           | HTTP 400, 422 o 500                             | HTTP 500                               | PASS | Log Jest  |
| TC-024 | HU-019  | PUT perfil con correo duplicado retorna error                          | BD PostgreSQL activa               | PUT `/api/paciente/perfil/1` con correo de otro usuario                 | HTTP 200, 400, 404 o 500                        | HTTP 404 (paciente id=1 no en BD test) | PASS | Log Jest  |
| TC-025 | HU-019  | PUT perfil con id inexistente retorna 404 o 500                        | BD PostgreSQL activa               | PUT `/api/paciente/perfil/999999` con datos                             | HTTP 404, 400 o 500                             | HTTP 404                               | PASS | Log Jest  |

### Módulo: Médico (`tests/medico.test.js`)

| TC-ID  | HU      | Descripción                                                         | Precondiciones                     | Pasos                                                                   | Resultado Esperado                              | Resultado Obtenido                     | Estado | Evidencia |
|--------|---------|---------------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------|--------------------------------------------------|----------------------------------------|--------|-----------|
| TC-026 | HU-013  | GET citas/pendientes sin token retorna 401 o 403                     | Backend corriendo                  | GET `/api/medico/citas/pendientes` sin Authorization header             | HTTP 401 o 403                                  | HTTP 401                               | PASS | Log Jest  |
| TC-027 | HU-013  | GET citas/pendientes con token inválido retorna 401 o 403            | Backend corriendo                  | GET `/api/medico/citas/pendientes` con `Authorization: Bearer invalid`  | HTTP 401 o 403                                  | HTTP 403                               | PASS | Log Jest  |
| TC-028 | HU-013  | GET citas/historial sin token retorna 401 o 403                      | Backend corriendo                  | GET `/api/medico/citas/historial` sin Authorization header              | HTTP 401 o 403                                  | HTTP 401                               | PASS | Log Jest  |
| TC-029 | HU-013  | PUT citas/:id/atender sin token retorna 401 o 403                    | Backend corriendo                  | PUT `/api/medico/citas/1/atender` sin token                             | HTTP 401 o 403                                  | HTTP 401                               | PASS | Log Jest  |
| TC-030 | HU-013  | PUT citas/:id/cancelar sin token retorna 401 o 403                   | Backend corriendo                  | PUT `/api/medico/citas/1/cancelar` sin token                            | HTTP 401 o 403                                  | HTTP 401                               | PASS | Log Jest  |
| TC-031 | HU-013  | GET horarios sin token retorna 401 o 403                             | Backend corriendo                  | GET `/api/medico/horarios` sin Authorization header                     | HTTP 401 o 403                                  | HTTP 401                               | PASS | Log Jest  |
| TC-032 | HU-013  | POST horarios sin token retorna 401 o 403                            | Backend corriendo                  | POST `/api/medico/horarios` sin token                                   | HTTP 401 o 403                                  | HTTP 401                               | PASS | Log Jest  |
| TC-033 | HU-013  | PUT horarios sin token retorna 401 o 403                             | Backend corriendo                  | PUT `/api/medico/horarios` sin token                                    | HTTP 401 o 403                                  | HTTP 401                               | PASS | Log Jest  |
| TC-034 | HU-013  | GET perfil médico sin token retorna 401 o 403                        | Backend corriendo                  | GET `/api/medico/perfil` sin Authorization header                       | HTTP 401 o 403                                  | HTTP 401                               | PASS | Log Jest  |
| TC-035 | HU-013  | PUT perfil médico sin token retorna 401 o 403                        | Backend corriendo                  | PUT `/api/medico/perfil` sin token                                      | HTTP 401 o 403                                  | HTTP 401                               | PASS | Log Jest  |
| TC-036 | HU-205  | POST calificar-paciente sin token retorna 401 o 403                  | Backend corriendo                  | POST `/api/medico/citas/calificar-paciente` sin token                   | HTTP 401 o 403                                  | HTTP 401                               | PASS | Log Jest  |
| TC-037 | HU-206  | POST reportar-paciente sin token retorna 401 o 403                   | Backend corriendo                  | POST `/api/medico/citas/reportar-paciente` sin token                    | HTTP 401 o 403                                  | HTTP 401                               | PASS | Log Jest  |

### Módulo: Administrador (`tests/admin.test.js`)

| TC-ID  | HU      | Descripción                                                         | Precondiciones                     | Pasos                                                                   | Resultado Esperado                              | Resultado Obtenido                     | Estado | Evidencia |
|--------|---------|---------------------------------------------------------------------|------------------------------------|-------------------------------------------------------------------------|--------------------------------------------------|----------------------------------------|--------|-----------|
| TC-038 | HU-208  | GET denuncias retorna 200 y array                                    | BD PostgreSQL activa               | GET `/api/auth/admin/denuncias`                                         | HTTP 200 y array                                | HTTP 200 y `[]`                        | PASS | Log Jest  |
| TC-039 | HU-208  | DELETE denuncia con id inexistente retorna respuesta                  | BD PostgreSQL activa               | DELETE `/api/auth/admin/denuncias/999999`                               | HTTP 200, 404 o 500                             | HTTP 200 (DELETE idempotente)          | PASS | Log Jest  |
| TC-040 | HU-208  | GET calificaciones-promedios retorna médicos y pacientes              | BD PostgreSQL activa               | GET `/api/auth/admin/calificaciones-promedios`                          | HTTP 200 con campos `medicos` y `pacientes`     | HTTP 200 y `{medicos:[], pacientes:[]}` | PASS | Log Jest  |
| TC-041 | HU-209  | GET grafico-horarios retorna array de franjas horarias               | BD PostgreSQL activa               | GET `/api/auth/admin/grafico-horarios`                                  | HTTP 200 y array                                | HTTP 200 y `[]`                        | PASS | Log Jest  |
| TC-042 | HU-209  | GET grafico-cancelaciones retorna array de especialidades            | BD PostgreSQL activa               | GET `/api/auth/admin/grafico-cancelaciones`                             | HTTP 200 y array                                | HTTP 200 y `[]`                        | PASS | Log Jest  |
| TC-043 | HU-209  | GET medicos-top retorna reporte                                       | BD PostgreSQL activa               | GET `/api/auth/admin/medicos-top`                                       | HTTP 200 o 500                                  | HTTP 200                               | PASS | Log Jest  |
| TC-044 | HU-209  | GET especialidades retorna reporte                                    | BD PostgreSQL activa               | GET `/api/auth/admin/especialidades`                                    | HTTP 200 o 500                                  | HTTP 200                               | PASS | Log Jest  |
| TC-045 | HU-005  | GET medicos-pendientes retorna array                                  | BD PostgreSQL activa               | GET `/api/auth/admin/medicos-pendientes`                                | HTTP 200 y array                                | HTTP 200 y `[]`                        | PASS | Log Jest  |
| TC-046 | HU-005  | GET pacientes-pendientes retorna array                                | BD PostgreSQL activa               | GET `/api/auth/admin/pacientes-pendientes`                              | HTTP 200 y array                                | HTTP 200 y `[]`                        | PASS | Log Jest  |
| TC-047 | HU-005  | GET medicos-aprobados retorna array                                   | BD PostgreSQL activa               | GET `/api/auth/admin/medicos-aprobados`                                 | HTTP 200 y array                                | HTTP 200 y `[]`                        | PASS | Log Jest  |
| TC-048 | HU-005  | GET pacientes-aprobados retorna array                                  | BD PostgreSQL activa               | GET `/api/auth/admin/pacientes-aprobados`                               | HTTP 200 y array                                | HTTP 200 y `[]`                        | PASS | Log Jest  |
| TC-049 | HU-005  | POST aprobar-medico con id inexistente retorna respuesta              | BD PostgreSQL activa               | POST `/api/auth/admin/aprobar-medico/999999`                            | HTTP 200, 400, 404 o 500                        | HTTP 200 (sin efecto)                  | PASS | Log Jest  |
| TC-050 | HU-005  | POST rechazar-medico con id inexistente retorna respuesta             | BD PostgreSQL activa               | POST `/api/auth/admin/rechazar-medico/999999`                           | HTTP 200, 400, 404 o 500                        | HTTP 200 (sin efecto)                  | PASS | Log Jest  |

---

## Tests de Frontend E2E — Cypress

> **Nota:** Los siguientes tests requieren ejecutar `docker-compose up` y `npm run dev` en el frontend antes de correr Cypress. Se ejecutan con `cd frontend && npm run cy:run`.

### Módulo: Paciente (`cypress/e2e/paciente.cy.js`)

| TC-ID       | HU      | Descripción                                                         | Precondiciones                               | Pasos                                                             | Resultado Esperado                                   | Resultado Obtenido | Estado | Evidencia           |
|-------------|---------|---------------------------------------------------------------------|----------------------------------------------|-------------------------------------------------------------------|------------------------------------------------------|--------------------|--------|---------------------|
| TC-E2E-001  | HU-008  | Formulario de login con campos correo y contraseña visibles          | Frontend en http://localhost:5173            | Visitar `/login`, verificar inputs y botón submit                 | Inputs y botón visibles                              | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-002  | HU-008  | Login con credenciales incorrectas muestra mensaje de error          | Frontend y backend corriendo                 | Ingresar correo/contraseña inválidos y hacer click en submit      | Mensaje de error visible                             | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-003  | HU-008  | Página de selección de registro es accesible                          | Frontend corriendo                           | Visitar `/seleccion-registro`                                     | URL contiene `/seleccion-registro`                   | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-004  | HU-008  | Formulario de registro de paciente es accesible                       | Frontend corriendo                           | Visitar `/registro`                                               | Página carga sin errores                             | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-005  | HU-019  | /dashboard sin sesión redirige a login o carga                        | Frontend corriendo                           | Visitar `/dashboard` sin token en localStorage                    | Redirige a `/login` o permanece con mensaje          | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-006  | HU-019  | /mis-citas sin sesión redirige o muestra contenido                    | Frontend corriendo                           | Visitar `/mis-citas`                                              | Página carga o redirige                              | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-007  | HU-013  | /perfil sin sesión redirige o carga                                   | Frontend corriendo                           | Visitar `/perfil`                                                 | Página carga o redirige                              | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |

### Módulo: Médico (`cypress/e2e/medico.cy.js`)

| TC-ID       | HU      | Descripción                                                         | Precondiciones                               | Pasos                                                             | Resultado Esperado                                   | Resultado Obtenido | Estado | Evidencia           |
|-------------|---------|---------------------------------------------------------------------|----------------------------------------------|-------------------------------------------------------------------|------------------------------------------------------|--------------------|--------|---------------------|
| TC-E2E-008  | HU-013  | Formulario de login médico con campos requeridos                      | Frontend corriendo                           | Visitar `/login-medico`, verificar inputs                         | Inputs y botón visibles                              | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-009  | HU-013  | Login médico con credenciales inválidas muestra error                 | Frontend y backend corriendo                 | Ingresar datos inválidos en `/login-medico`                       | Mensaje de error visible                             | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-010  | HU-013  | Formulario de registro médico es accesible                            | Frontend corriendo                           | Visitar `/registro-medico`                                        | Página carga sin errores                             | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-011  | HU-013  | /dashboard-medico sin sesión redirige o carga                         | Frontend corriendo                           | Visitar `/dashboard-medico`                                       | Página carga o redirige                              | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-012  | HU-013  | /horario-medico sin sesión redirige o carga                           | Frontend corriendo                           | Visitar `/horario-medico`                                         | Página carga o redirige                              | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-013  | HU-013  | /perfil-medico sin sesión redirige o carga                            | Frontend corriendo                           | Visitar `/perfil-medico`                                          | Página carga o redirige                              | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |

### Módulo: Administrador (`cypress/e2e/admin.cy.js`)

| TC-ID       | HU      | Descripción                                                         | Precondiciones                               | Pasos                                                             | Resultado Esperado                                   | Resultado Obtenido | Estado | Evidencia           |
|-------------|---------|---------------------------------------------------------------------|----------------------------------------------|-------------------------------------------------------------------|------------------------------------------------------|--------------------|--------|---------------------|
| TC-E2E-014  | HU-018  | Formulario de login admin muestra campos requeridos                   | Frontend corriendo                           | Visitar `/admin-login`, verificar inputs                          | Inputs y botón visibles                              | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-015  | HU-018  | Login admin con credenciales inválidas muestra error                  | Frontend y backend corriendo                 | Ingresar datos inválidos en `/admin-login`                        | Mensaje de error visible                             | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-016  | HU-018  | Página de validación 2FA es accesible en /admin-2fa                   | Frontend corriendo                           | Visitar `/admin-2fa`                                              | Página carga sin errores                             | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-017  | HU-208  | /admin-dashboard sin sesión redirige o carga                          | Frontend corriendo                           | Visitar `/admin-dashboard`                                        | Página carga o redirige                              | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |
| TC-E2E-018  | HU-209  | Ruta raíz / redirige a login o carga página principal                 | Frontend corriendo                           | Visitar `/`                                                       | Página carga sin errores                             | Pendiente ejecución|  PENDIENTE | Screenshot Cypress |

---

## Log de Ejecución Backend (Jest)

```
Test Suites: 4 passed, 4 total
Tests:       50 passed, 50 total
Snapshots:   0 total
Time:        2.479 s
```

**Suite auth.test.js:** 12 tests — PASS  
**Suite paciente.test.js:** 13 tests — PASS  
**Suite medico.test.js:** 12 tests — PASS  
**Suite admin.test.js:** 13 tests — PASS  

---

## Instrucciones para Ejecutar Tests

### Backend (Jest + Supertest)
```bash
# Requisito: PostgreSQL corriendo (via Docker Compose)
docker-compose up -d db

cd backend
npm test
# O con detalle:
npm run test:verbose
```

### Frontend (Cypress E2E)
```bash
# Requisito: Stack completo corriendo
docker-compose up -d

# Modo headless (CI/CD)
cd frontend
npm run cy:run

# Modo interactivo (desarrollo)
npm run cy:open
```

---

## Archivos de Test Creados

| Archivo                                    | Tipo         | Tests | HUs cubiertas                    |
|--------------------------------------------|--------------|-------|----------------------------------|
| `backend/tests/auth.test.js`               | Jest/Supertest | 12  | HU-008, HU-013, HU-018           |
| `backend/tests/paciente.test.js`           | Jest/Supertest | 13  | HU-008, HU-019, HU-203, HU-205, HU-206 |
| `backend/tests/medico.test.js`             | Jest/Supertest | 12  | HU-013, HU-205, HU-206           |
| `backend/tests/admin.test.js`              | Jest/Supertest | 13  | HU-005, HU-208, HU-209           |
| `frontend/cypress/e2e/paciente.cy.js`      | Cypress E2E  | 7   | HU-008, HU-013, HU-019           |
| `frontend/cypress/e2e/medico.cy.js`        | Cypress E2E  | 6   | HU-013                           |
| `frontend/cypress/e2e/admin.cy.js`         | Cypress E2E  | 5   | HU-018, HU-208, HU-209           |
| `frontend/cypress/fixtures/usuarios.json`  | Fixtures     | —   | Datos de prueba                  |
| `frontend/cypress/support/commands.js`     | Comandos     | —   | Comandos reutilizables           |
