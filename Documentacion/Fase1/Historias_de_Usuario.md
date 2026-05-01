# Historias de Usuario - SaludPlus

Este documento detalla los requerimientos ágiles del sistema, estimaciones y criterios de aceptación, base para nuestro tablero Kanban.

---

### HU-001 / HU-201: Registro de Paciente con Archivos (PDF)

**Como** paciente nuevo,
**Quiero** registrarme en el sistema ingresando mis datos personales y mi DPI en formato PDF,
**Para** poder tener una cuenta verificada y programar citas médicas.

- **Story Points:** 5
- **Prioridad:** Alta (Sprint 1 / Sprint 2)
- **Criterios de Aceptación:**
  - El formulario debe pedir Nombre, Apellido, DPI, Fecha de Nacimiento, Correo, Contraseña y un archivo PDF obligatorio del DPI.
  - La contraseña debe almacenarse encriptada en la base de datos usando `bcryptjs`.
  - Si faltan los archivos o el correo/DPI ya existen, el sistema no debe permitir el registro.
  - El registro debe guardar las rutas del PDF en la base de datos para revisión del administrador.

---

### HU-002 / HU-201: Registro de Médico con Archivos (PDF)

**Como** médico profesional,
**Quiero** enviar mi solicitud de registro adjuntando obligatoriamente mi foto reciente y mi CV en formato PDF,
**Para** poder ofrecer mis servicios en la clínica SaludPlus.

- **Story Points:** 5
- **Prioridad:** Alta (Sprint 1 / Sprint 2)
- **Criterios de Aceptación:**
  - El formulario debe incluir carga de archivos obligatoria para la fotografía y un archivo `.pdf` para el CV.
  - El número de colegiado y especialidad son campos obligatorios.
  - La contraseña debe encriptarse.
  - El registro inicial debe quedar con estado 'pendiente' bloqueando su acceso hasta que el administrador lo apruebe.

---

### HU-202: Validación de Correo con Token

**Como** usuario nuevo (Médico o Paciente),
**Quiero** recibir un código de verificación en mi correo electrónico tras registrarme,
**Para** validar mi identidad en mi primer inicio de sesión.

- **Story Points:** 8
- **Prioridad:** Alta (Sprint 1)
- **Criterios de Aceptación:**
  - Al registrarse, el backend debe generar un token único y enviarlo mediante correo electrónico (Nodemailer) con diseño de "Salud Plus", logo e instrucciones.
  - En el primer inicio de sesión, el sistema debe solicitar: Correo, Contraseña y Token.
  - Se debe validar que el token sea correcto Y que el administrador ya haya aprobado la cuenta.
  - Tras el primer inicio exitoso, la base de datos marca el correo como verificado y en futuros ingresos solo se pedirá Correo y Contraseña.

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

### HU-005 / HU-207: Aceptar/Rechazar Usuarios y Visor PDF Incrustado

**Como** administrador del sistema,
**Quiero** ver la lista de médicos y pacientes pendientes visualizando directamente sus documentos PDF (DPI/CV) en la pantalla,
**Para** garantizar y agilizar el proceso de verificación sin tener que descargar archivos en mi computadora.

- **Story Points:** 5
- **Prioridad:** Alta (Sprint 1 / Sprint 2)
- **Criterios de Aceptación:**
  - El dashboard debe mostrar tablas separadas para médicos y pacientes pendientes.
  - Los documentos (DPI de paciente y CV de médico) deben mostrarse incrustados en la web usando etiquetas `<iframe/>` o `<embed/>`.
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

---

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
  - Al intentar cancelar, el backend debe validar que existan al menos 24 horas de anticipación a la cita. Aparece un mensaje de confirmación antes de proceder.
  - Una vez cancelada, la cita desaparece de la lista de citas activas.
  - El paciente puede ver su historial de citas atendidas y canceladas con:
    fecha, nombre del médico, dirección de la clínica, motivo, tratamiento
    (solo si fue atendida) y estado de la cita.

---

### HU-203: Tratamiento Estructurado Médico

**Como** médico,
**Quiero** registrar un diagnóstico y uno o más medicamentos al atender una cita,
**Para** ofrecer al paciente un tratamiento estructurado y detallado que pueda consultar e imprimir como receta médica.

- **Story Points:** 8
- **Prioridad:** Alta (Sprint 1)
- **Criterios de Aceptación:**
  - Al dar clic en "Atender", el médico accede a un formulario con: Campo **Diagnóstico** (obligatorio) y una sección de **Medicamentos** con al menos uno obligatorio (pudiendo agregar o eliminar dinámicamente).
  - Cada medicamento solicita: **Nombre**, **Cantidad**, **Tiempo** y **Descripción de la dosis** (todos obligatorios).
  - El sistema valida que el diagnóstico no esté vacío y que cada medicamento tenga todos sus campos completos antes de guardar.
  - Al guardar, la cita cambia de estado a `Atendido` y desaparece de la lista de citas pendientes del médico.
  - Los datos se guardan en tablas separadas mediante llaves foráneas (`citas` y `medicamentos`).

---

### HU-204: Visualización y Receta PDF Paciente

**Como** paciente,
**Quiero** visualizar mi diagnóstico y descargar mi receta médica en formato PDF,
**Para** tener un documento formal de mis medicamentos y poder presentarlo en una farmacia.

- **Story Points:** 5
- **Prioridad:** Alta (Sprint 1)
- **Criterios de Aceptación:**
  - El paciente puede visualizar en su historial el diagnóstico y la tabla de medicamentos recetados (nombre, cantidad, tiempo, descripción de dosis).
  - El paciente dispone de un botón "Imprimir Receta Médica" que genera y descarga un PDF.
  - El PDF debe incluir: Encabezado (nombre de la clínica "SaludPlus", fecha de emisión, teléfono), Datos del médico (nombre, especialidad, colegiado), Diagnóstico, Tabla de medicamentos y Pie de página con firma del médico.

---

### HU-205: Sistema de Calificaciones Cruzadas

**Como** paciente o médico,
**Quiero** calificar la atención y el comportamiento de la otra parte tras una cita,
**Para** ayudar a mantener un estándar de calidad y respeto en la plataforma.

- **Story Points:** 3
- **Prioridad:** Media (Sprint 1)
- **Criterios de Aceptación:**
  - El paciente califica al médico asignando de 0 a 5 estrellas y un comentario opcional.
  - El médico califica al paciente asignando de 0 a 5 estrellas y un comentario opcional.
  - SOLO se permite realizar y guardar la calificación si la cita se encuentra en estado "Atendida".
  - El sistema evita que un usuario califique la misma cita más de una vez.

---

### HU-206: Sistema de Reportes/Denuncias

**Como** paciente o médico,
**Quiero** tener la opción de denunciar un comportamiento inadecuado de la contraparte,
**Para** notificar a los administradores sobre problemas graves durante mi atención.

- **Story Points:** 3
- **Prioridad:** Media (Sprint 1)
- **Criterios de Aceptación:**
  - Pacientes y médicos tienen un botón para reportarse mutuamente desde el historial.
  - El formulario de denuncia exige seleccionar una categoría predefinida mediante un ComboBox (ej. "Conducta inapropiada", "Negligencia").
  - El usuario debe proporcionar una explicación en un área de texto.
  - Solo se pueden generar denuncias sobre citas que estén en estado "Atendidas".

---

### HU-208: Gestión de Reportes y Calificaciones

**Como** Administrador del sistema,
**Quiero** tener un panel para revisar todas las denuncias y visualizar los promedios de calificaciones de los usuarios,
**Para** tomar acciones disciplinarias si es necesario y garantizar la seguridad de la comunidad.

- **Story Points:** 5
- **Prioridad:** Media (Sprint 2)
- **Criterios de Aceptación:**
  - El sistema debe mostrar una bandeja centralizada con las denuncias emitidas contra médicos y pacientes, detallando la categoría y el motivo.
  - El administrador debe tener un botón para "Descartar/Rechazar" la denuncia (eliminándola de la vista) y otro para "Dar de baja" al usuario acusado.
  - En una sección separada, se deben mostrar tablas con los promedios de calificación acumulados de todos los médicos y pacientes del sistema.

---

### HU-209: Nuevos Reportes Analíticos

**Como** Administrador del sistema,
**Quiero** visualizar nuevos gráficos analíticos,
**Para** identificar tendencias de uso y comportamiento en la clínica.

- **Story Points:** 5
- **Prioridad:** Baja (Sprint 2)
- **Criterios de Aceptación:**
  - Integrar 2 nuevos gráficos utilizando librerías de visualización (ej. Chart.js).
  - Gráfico 1: Un reporte en forma de Dona/Pastel que muestre las Franjas Horarias más demandadas (Mañana, Tarde, Noche).
  - Gráfico 2: Un reporte en forma de Barras que muestre las Especialidades médicas con mayor cantidad de citas "Canceladas".

---

### HU-210: Pruebas Automatizadas E2E y Unitarias

**Como** equipo de desarrollo,
**Queremos** implementar pruebas automatizadas en nuestro código,
**Para** asegurar la calidad del software y prevenir errores en funcionalidades críticas antes de desplegar.

- **Story Points:** 8
- **Prioridad:** Alta (Sprint 2)
- **Criterios de Aceptación:**
  - Se deben crear y pasar exitosamente al menos 5 pruebas Unitarias en el backend (ej. usando Jest/Mocha) evaluando funciones o endpoints críticos.
  - Se deben crear y pasar exitosamente al menos 5 pruebas End-to-End (E2E) simulando el comportamiento del usuario en la interfaz gráfica (ej. usando Selenium, Cypress o Puppeteer).
  - Las pruebas E2E deben evaluar flujos completos (ej. Login exitoso, agendar cita, etc.).

---

### HU-211: Pipeline CI/CD y Despliegue Cloud

**Como** equipo de desarrollo,
**Queremos** automatizar el proceso de integración continua y desplegar el proyecto en la nube,
**Para** que la aplicación sea accesible públicamente en internet sin intervención manual tras cada actualización.

- **Story Points:** 8
- **Prioridad:** Alta (Sprint 2)
- **Criterios de Aceptación:**
  - El Frontend (React) debe estar desplegado y accesible mediante una URL pública utilizando plataformas como Vercel, Netlify o AWS S3.
  - Se debe configurar un pipeline automatizado mediante GitHub Actions.
  - El pipeline debe tener stages de Build, Test (ejecutando las pruebas de la HU-210) y Deploy del Backend hacia un servidor en la nube.
  - El trigger (disparador) del pipeline de CI/CD debe configurarse para que se ejecute **únicamente** cuando se haga un push/merge a la rama `main`.
