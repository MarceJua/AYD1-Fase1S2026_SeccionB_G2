# 📚 Historias de Usuario - SaludPlus

Este documento detalla los requerimientos ágiles del sistema, estimaciones y criterios de aceptación, base para nuestro tablero Kanban.

---

### HU-001: Registro de Paciente

**Como** paciente nuevo,
**Quiero** registrarme en el sistema ingresando mis datos personales,
**Para** poder tener una cuenta y programar citas médicas.

- **Story Points:** 3
- **Prioridad:** Alta (Sprint 1)
- **Criterios de Aceptación:**
  - El formulario debe pedir Nombre, Apellido, DPI, Fecha de Nacimiento, Correo y Contraseña.
  - La contraseña debe almacenarse encriptada en la base de datos usando `bcryptjs`.
  - Si el correo o el DPI ya existen, el sistema debe mostrar un mensaje de error.
  - Al registrarse correctamente, el estado del paciente debe ser 'aprobado' por defecto.

---

### HU-002: Registro de Médico

**Como** médico profesional,
**Quiero** enviar mi solicitud de registro adjuntando mi foto y colegiado,
**Para** poder ofrecer mis servicios en la clínica SaludPlus.

- **Story Points:** 5
- **Prioridad:** Alta (Sprint 1)
- **Criterios de Aceptación:**
  - El formulario debe incluir carga de archivos obligatoria para la fotografía.
  - El número de colegiado y especialidad son campos obligatorios.
  - La contraseña debe encriptarse.
  - El registro inicial debe quedar con estado 'pendiente' en la base de datos, bloqueando su acceso hasta que el administrador lo apruebe.

---


### HU-004: Login de Administrador

**Como** administrador de plataforma,
**Quiero** ingresar al modulo de administrador,
**Para** poder administrar, aprovar, revisar y denegar solicitudes de perfiles.

- **Story Points:** 5
- **Prioridad:** Alta (Sprint 1)
- **Criterios de Aceptación:**
  - El formulario debe de recibir la informacion de forma segura y clara.
  - El sistemas debe de implemetar un sistema de doble autenticacion mediante una constrasenia en un archivo txt.
  - La contraseñas deben de encriptarse.
  - El administrador aceptara o denegara los nuevos registro de medicos en el sistema.

---

### HU-005: Aceptar/Rechazar Usuarios

**Como** administrador del sistema,
**Quiero** ver la lista de médicos y pacientes pendientes y tener la opción de aprobarlos o rechazarlos,
**Para** garantizar que solo personal verificado ingrese a la plataforma.

- **Story Points:** 5
- **Prioridad:** Alta (Sprint 1)
- **Criterios de Aceptación:**
  - El dashboard debe mostrar dos tablas separadas: una para médicos pendientes y otra para pacientes pendientes.
  - Debe mostrarse la foto del médico renderizada correctamente.
  - Al hacer clic en "Aceptar", el estado en la BD debe cambiar a 'aprobado'.
  - Al hacer clic en "Rechazar", el estado en la BD debe cambiar a 'rechazado'.

---

_(Roberto debe continuar este formato hasta la HU-014)._
