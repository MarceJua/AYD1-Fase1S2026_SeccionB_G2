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

### HU-006: Configurar Docker y docker-compose.yml

**Como** equipo de desarrollo,
**Queremos** tener la aplicación en un container de Docker,
**Para** poder levantar el proyecto fácilmente sin
problemas de compatibilidad entre las máquinas del equipo de desarrollo.

- **Story Points:** 3
- **Prioridad:** Alta (Sprint 1)
- **Criterios de Aceptación:**
  - Existe un `docker-compose.yml` que levanta frontend, backend y base de datos.
  - El comando `docker-compose up --build` levanta el proyecto completo sin errores.
  - Las variables de entorno están documentadas en un `.env`.
  - El contenedor del backend puede leer archivos subidos (como `auth2-ayd1.txt`).

---

### HU-007: Página Principal del Paciente

**Como** paciente,
**Quiero** ver una lista de médicos disponibles en la plataforma luego de registrarme,
**Para** poder encontrar rápidamente al doctor que necesito y ver sus datos y horarios.

- **Story Points:** 3
- **Prioridad:** Alta (Sprint 1)
- **Criterios de Aceptación:**
  - Se muestran todos los médicos registrados y aprobados, excepto aquellos
    con los que el paciente ya tiene una cita activa.
  - Cada tarjeta de médico muestra: nombre completo, especialidad,
    dirección de clínica y foto.
  - El paciente puede buscar médicos por especialidad y dias de consulta.

---

### HU-008: Programar Cita y Validación de Traslapes

**Como** paciente,
**Quiero** agendar una cita con un medico de mi preferencia,
**Para** asegurarme un espacio de atención en un horario de que me quede mejor.

- **Story Points:** 8
- **Prioridad:** Alta (Sprint 1)
- **Criterios de Aceptación:**
  - Al seleccionar un médico se muestran sus días y horarios disponibles,
    pudiendo seleccionar una fecha específica.
  - El formulario de cita solicita: fecha, hora y motivo de la consulta.
  - El sistema valida que la fecha esté dentro de los días en los que el medico tiene horario de atencion.
  - El sistema valida que el horario seleccionado esté disponible.
  - Un paciente puede tener citas con distintos médicos, pero no más de una
    con el mismo doctor.
  - No se permiten traslapes de citas para el mismo paciente en igual fecha y hora.
  - Si algo no pasa la validación, se muestra un mensaje explicando el motivo.

---

### HU-009: Establecer Horarios del Médico

**Como** médico,
**Quiero** establecer los días y horas en que atenderé pacientes,
**Para** que los pacientes puedan ver mi disponibilidad real y agendar citas.

- **Story Points:** 5
- **Prioridad:** Media (Sprint 2)
- **Criterios de Aceptación:**
  - El médico puede seleccionar los días de la semana en que atenderá y un rango de horas de inicio a fin para los dias seleccionados.
  - El médico puede actualizar sus días y horario cuando lo desee.
  - Si hay citas activas que quedan fuera del nuevo horario, el sistema
    bloquea la actualización y avisa al médico.

---
### HU-010: Gestión de Citas y Envío de Correo de Cancelación

**Como** medico,
**Quiero** ver y administrar las citas con mis pacientes,
**Para** llevar control de mi agenda y notificar a mis pacientes de posibles cancelaciones o actualizaciones.

- **Story Points:** 8
- **Prioridad:** Media (Sprint 2)
- **Criterios de Aceptación:**
  - Al iniciar sesión, el médico ve todas sus citas pendientes
    por fecha, mostrando: fecha, hora, nombre del paciente y motivo.
  - El médico puede marcar una cita como atendida, ingresando el tratamiento
    indicado; 
  - la cita desaparece de la lista de pendientes. luego de marcarla como atendida
  - El médico puede cancelar citas de pacientes enviando una notificacion
  - Al cancelar, se envía automáticamente un correo al paciente con: fecha,
    hora, motivo de la cita cancelada, nombre del médico y un mensaje de disculpa.

---

### HU-011: Historiales Médicos

**Como** paciente o médico,
**Quiero** poder consultar el historial de citas pasadas,
**Para** tener un registro claro de las consultas realizadas y los tratamientos recibidos o dados.

- **Story Points:** 5
- **Prioridad:** Media (Sprint 2)
- **Criterios de Aceptación:**
  - El paciente puede ver sus citas atendidas y canceladas con: fecha, nombre
    del médico, dirección de clínica, motivo, tratamiento (si fue atendida)
    y estado de la cita.
  - El médico puede ver su historial con: fecha, hora, nombre del paciente
    y estado de la cita (Atendido, Cancelado por paciente o por médico).

---


### HU-012: Reportes Analíticos Visuales

**Como** administrador,
**Quiero** generar reportes sobre el uso de la plataforma,
**Para** tomar mejores decisiones sobre los servicios que se ofrecen y obtener metricas de uso de la aplicacion, de los medicos y servicios.

- **Story Points:** 5
- **Prioridad:** Media (Sprint 2)
- **Criterios de Aceptación:**
  - Se generan al menos 2 reportes con información relevante del sistema.
  - Los reportes se presentan de forma visual y clara.

---

### HU-013: Actualizar Perfil (Médico y Paciente)

**Como** usuario de la plataforma (médico o paciente),
**Quiero** poder, ver y editar los datos de mi perfil,
**Para** mantener mi información siempre actualizada.

- **Story Points:** 3
- **Prioridad:** Media (Sprint 2)
- **Criterios de Aceptación:**
  - Se muestran todos los campos del perfil con la informacion previa y editables.
  - El correo electrónico se muestra como solo lectura y no puede modificarse.
  - El médico puede actualizar: nombre, apellido, DPI, fecha de nacimiento,
    género, dirección, teléfono, fotografía, número colegiado,
    especialidad y dirección de clínica.
  - El paciente puede actualizar: nombre, apellido, DPI, género, dirección,
    teléfono, fecha de nacimiento y fotografía.
  - Los cambios se guardan correctamente y se muestran en el perfil de inmediato.

---

### HU-014: Ver y Dar de Baja Usuarios Aprobados

**Como** administrador,
**Quiero** ver la lista completa de pacientes y médicos activos en el sistema
y tener la opción de darlos de baja,
**Para** mantener el control sobre quién usa la plataforma y actuar ante
cualquier situación que lo amerite.

- **Story Points:** 3
- **Prioridad:** Media (Sprint 2)
- **Criterios de Aceptación:**
  - Se muestra una lista de todos los pacientes aprobados con opción de dar de baja.
  - Se muestra una lista de todos los médicos aprobados con opción de dar de baja.
  - Al dar de baja a un usuario, este pierde acceso al sistema inmediatamente.

  ---

  ### HU-018: Ver Horarios del Médico y Lista de Citas Activas del Paciente

**Como** paciente registrado,
**Quiero** poder consultar los horarios disponibles de un médico y ver mis
citas pendientes,
**Para** planificar mejor mis consultas y tener un seguimiento de
mis citas activas.

- **Story Points:** 5
- **Prioridad:** Media (Sprint 2)
- **Criterios de Aceptación:**
  - Al seleccionar un médico desde la página principal, se despliega su
    información de horario mostrando los días que atiende y el rango de horas.
  - El paciente puede filtrar por una fecha específica para ver los horarios
    ocupados y disponibles de ese día.
  - Si el médico no atiende en la fecha seleccionada, se notifica al paciente.
  - El paciente puede ver su lista de citas activas (aún no atendidas) con:
    fecha, hora, nombre del médico, dirección de la clínica y motivo de la cita.


### HU-019: Cancelar Cita e Historial de Citas del Paciente

**Como** paciente registrado en la plataforma,
**Quiero** poder cancelar una cita activa y consultar el historial de
todas mis citas pasadas,
**Para** tener control total sobre mis consultas médicas y llevar un
registro de mi historial de atención.

- **Story Points:** 5
- **Prioridad:** Media (Sprint 2)
- **Criterios de Aceptación:**
  - El paciente puede cancelar una cita desde la vista de citas activas.
  - Al intentar cancelar, aparece un mensaje de confirmación preguntando
    si está seguro antes de proceder.
  - Una vez cancelada, la cita desaparece de la lista de citas activas.
  - El paciente puede ver su historial de citas atendidas y canceladas con:
    fecha, nombre del médico, dirección de la clínica, motivo, tratamiento
    (solo si fue atendida) y estado de la cita (Atendido, Cancelado por
    paciente o por médico).