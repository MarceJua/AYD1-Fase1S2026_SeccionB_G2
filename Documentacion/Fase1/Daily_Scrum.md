# Registro de Daily Scrum - SaludPlus

## SPRINT 1: Infraestructura y Autenticación

---

# Daily Scrum — Sprint 1 — Día 1

**Fecha:** 6 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Realizamos la Sprint Planning 1 y asigné las tareas en el tablero Kanban.
**¿Qué haré hoy?**
Iniciar la configuración de la arquitectura base creando el `docker-compose.yml` para aislar la base de datos PostgreSQL en un contenedor local.
**¿Impedimentos?**
Asegurarme de que todos los miembros del equipo tengan Docker Desktop instalado.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Ayudé en la priorización del Backlog durante la Sprint Planning.
**¿Qué haré hoy?**
Comenzar con la HU-001, estructurando el formulario de registro de pacientes en el frontend usando React.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
Participé en la Sprint Planning y analicé los requerimientos de la HU-002.
**¿Qué haré hoy?**
Diseñar el componente visual para el registro de médicos en el frontend.
**¿Impedimentos?**
Investigar cómo manejar la carga de archivos (fotos) desde React hacia el backend.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
Revisión de las épicas asignadas para el Sprint 1.
**¿Qué haré hoy?**
Empezar la redacción formal de las Historias de Usuario completas en la documentación y tomar capturas iniciales del Kanban.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
Alineación con el equipo sobre el diseño general en la Sprint Planning.
**¿Qué haré hoy?**
Iniciar con los prototipos UI (Figma) para tener una línea gráfica unificada antes de programar la HU-005.
**¿Impedimentos?**
Definir la paleta de colores oficial con el equipo.

---

# Daily Scrum — Sprint 1 — Día 2

**Fecha:** 8 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Levanté el contenedor de PostgreSQL con un volumen persistente (`pgdata`).
**¿Qué haré hoy?**
Crear el archivo `init.sql` para que las tablas de Pacientes y Médicos se creen automáticamente al levantar Docker.
**¿Impedimentos?**
Sincronizar la lectura del archivo `.env` dentro de los contenedores.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Terminé la interfaz básica del registro de pacientes.
**¿Qué haré hoy?**
Empezar el backend (Express) para recibir los datos del registro y conectarlos con la tabla que creó Marcelo.
**¿Impedimentos?**
Aprender a implementar `bcryptjs` para la encriptación obligatoria.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
Formulario de médicos terminado en React.
**¿Qué haré hoy?**
Configurar `multer` en el backend para poder recibir y almacenar físicamente la fotografía del médico.
**¿Impedimentos?**
Problemas con las rutas absolutas al intentar guardar la foto en el sistema de archivos de Linux dentro de Docker.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
Terminé de redactar las HU del Sprint 1.
**¿Qué haré hoy?**
Empezar a programar la HU-004 (Login de Admin). Configurar el primer factor de autenticación estático.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
Aprobamos la línea gráfica en Figma.
**¿Qué haré hoy?**
Empezar a programar la vista del módulo Administrador (HU-005) para listar usuarios pendientes.
**¿Impedimentos?**
Esperando que los registros estén funcionales para tener datos de prueba.

---

# Daily Scrum — Sprint 1 — Día 3

**Fecha:** 10 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Terminé de conectar los contenedores de Front y Back. Todo compila bien con `docker-compose up --build`.
**¿Qué haré hoy?**
Empezar a redactar el Manual Técnico en Markdown explicando la arquitectura Docker.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Logré encriptar las contraseñas y guardarlas en la base de datos local.
**¿Qué haré hoy?**
Implementar el Login de paciente generando el JWT (JSON Web Token).
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
Solucioné el problema de `multer` usando `path.join`.
**¿Qué haré hoy?**
Finalizar el endpoint de Login para Médicos y asegurar que solo ingresen si su estado es 'aprobado'.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
Primer factor de Admin completado.
**¿Qué haré hoy?**
Implementar la lectura del archivo de texto `auth2-ayd1.txt` para el segundo factor de autenticación.
**¿Impedimentos?**
El módulo `fs` de Node no encontraba el archivo, necesito ajustar la ruta de ejecución.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
Maqueté la tabla de usuarios pendientes en el panel de administrador.
**¿Qué haré hoy?**
Crear los endpoints en el backend para aprobar o rechazar médicos haciendo el UPDATE en la BD.
**¿Impedimentos?**
Ninguno por el momento.

---

# Daily Scrum — Sprint 1 — Día 4

**Fecha:** 11 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Avancé un 50% del Manual Técnico.
**¿Qué haré hoy?**
Revisar ramas y PRs para asegurar que se cumpla el GitFlow. Apoyar a Rafael con ajustes en la base de datos para la HU-005.
**¿Impedimentos?**
Tuvimos un pequeño cruce de ramas, pero lo solucionamos redirigiendo un PR hacia `develop`.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Login de paciente finalizado con éxito (HU-001).
**¿Qué haré hoy?**
Avanzar con la redacción del documento de Requerimientos Funcionales/No Funcionales.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
HU-002 finalizada. El médico se registra y se bloquea si no está aprobado.
**¿Qué haré hoy?**
Empezar el Diagrama Entidad-Relación oficial para la documentación.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
Solucioné la lectura del archivo y el 2FA funciona correctamente (HU-004).
**¿Qué haré hoy?**
Limpiar el código, hacer commit con Conventional Commits y crear el PR hacia develop.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
API de aprobación terminada, pero faltaban datos en la consulta SQL.
**¿Qué haré hoy?**
Integrar el frontend de Admin con el Backend y verificar que los botones cambien el estado a 'aprobado' o 'rechazado'.
**¿Impedimentos?**
Ninguno por el momento.

---

# Daily Scrum — Sprint 1 — Día 5

**Fecha:** 12 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Agregué los campos completos al script `init.sql` e implementé la solución para renderizar imágenes en el servidor Express.
**¿Qué haré hoy?**
Finalizar el Manual Técnico y agregar el diagrama de la arquitectura con Mermaid.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Documento de requerimientos listo.
**¿Qué haré hoy?**
Hacer pruebas de integración cruzadas: registrar un paciente y verificar que la contraseña se guarde encriptada en la BD Docker.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
Diagrama Entidad-Relación terminado.
**¿Qué haré hoy?**
Ayudar con pruebas de integración: subir una foto de médico y confirmar que se guarde en el volumen `uploads`.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
PR de HU-004 aprobado en develop.
**¿Qué haré hoy?**
Actualizar el tablero Kanban a la columna de "Done" para las tareas del Sprint 1 y tomar las capturas finales.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
Módulo de Administrador completado (HU-005). Los botones aprueban correctamente a los usuarios.
**¿Qué haré hoy?**
Avanzar con el Manual de Usuario tomando capturas de pantalla de las vistas funcionales.
**¿Impedimentos?**
Ninguno por el momento.

---

# Daily Scrum — Sprint 1 — Día 6

**Fecha:** 13 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Manual Técnico subido a la rama de documentación.
**¿Qué haré hoy?**
Liderar la Sprint Retrospective 1, grabar el video y asegurar que todo el código esté limpio en `develop`.
**¿Impedimentos?**
Ninguno, listos para cerrar el Sprint.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Pruebas de integración aprobadas.
**¿Qué haré hoy?**
Participar en la Retro y preparar las HU del Sprint 2 en el tablero.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
Pruebas de carga de imágenes aprobadas.
**¿Qué haré hoy?**
Participar en la Retro y revisar el diseño general de la base de datos para las Citas del próximo sprint.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
Documentación del Kanban subida al repo.
**¿Qué haré hoy?**
Participar en la Retro.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
Manual de Usuario (Parte 1) completado.
**¿Qué haré hoy?**
Participar en la Retro y subir mis cambios a GitHub.
**¿Impedimentos?**
Ninguno por el momento.

---

## SPRINT 2: Lógica de Citas y Reportes

---

# Daily Scrum — Sprint 2 — Día 1

**Fecha:** 15 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Ayer realizamos la Sprint Planning 2 y asignamos tareas.
**¿Qué haré hoy?**
Iniciar con la HU-014 (Dar de baja usuarios), agregando el soft delete a la tabla de pacientes y médicos.
**¿Impedimentos?**
Asegurarme de que la baja bloquee el login correctamente.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Actualicé el Kanban para el Sprint 2.
**¿Qué haré hoy?**
Comenzar a diseñar la Página Principal del Paciente (HU-007) donde verá sus citas futuras.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
Revisión de la lógica de citas médicas.
**¿Qué haré hoy?**
Crear el endpoint de Programar Cita (HU-008) y empezar a programar la lógica para evitar traslapes de horarios.
**¿Impedimentos?**
Manejar correctamente el formato de fechas entre el Front y el Back.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
Revisé los requerimientos de la HU-009.
**¿Qué haré hoy?**
Crear la tabla en SQL y la interfaz para que el médico pueda establecer sus horarios disponibles.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
Asignación de tareas aceptada.
**¿Qué haré hoy?**
Empezar a estructurar el dashboard del Médico para la gestión de citas diarias (HU-010).
**¿Impedimentos?**
Ninguno por el momento.

---

# Daily Scrum — Sprint 2 — Día 2

**Fecha:** 17 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Implementé la HU-014. El Admin ya puede ver activos y dar de baja cambiando el estado.
**¿Qué haré hoy?**
Revisar el estado de los compañeros y comenzar a planificar las consultas SQL complejas para los 2 Reportes Analíticos (HU-012).
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Página principal de paciente terminada a nivel visual.
**¿Qué haré hoy?**
Comenzar la HU-013 (Actualizar Perfil Paciente) agregando el endpoint PUT en el backend.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
La validación de traslape está en proceso.
**¿Qué haré hoy?**
Finalizar la validación de citas y permitir que el paciente vea solo los horarios libres del médico.
**¿Impedimentos?**
Se requiere que Robert termine los horarios para poder hacer las pruebas reales.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
Endpoint de registro de horarios finalizado.
**¿Qué haré hoy?**
Conectar el frontend para que el médico seleccione los días y empezar la actualización de su perfil (HU-013).
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
Dashboard del médico maquetado.
**¿Qué haré hoy?**
Implementar la funcionalidad de "Atender Cita" y registrar el historial/tratamiento (HU-011).
**¿Impedimentos?**
Ninguno por el momento.

---

# Daily Scrum — Sprint 2 — Día 3

**Fecha:** 19 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Terminé las consultas SQL para los reportes de especialidades más demandadas.
**¿Qué haré hoy?**
Conectar las consultas con gráficos visuales en el frontend del Administrador (HU-012).
**¿Impedimentos?**
Elegir una buena librería de gráficos para React.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Actualización de perfil de paciente terminada.
**¿Qué haré hoy?**
Revisar el Diagrama de Casos de Uso extendido y ayudar a conectar la página de paciente con las citas de Alex.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
Lógica de traslapes y horarios libres terminada.
**¿Qué haré hoy?**
Realizar pull request de HU-008 a develop y verificar que todo el flujo funcione desde cero.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
Perfil del médico y horarios actualizables listos (HU-009 y HU-013).
**¿Qué haré hoy?**
Avanzar con la redacción del tablero Kanban del Sprint 2 para la entrega.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
Lógica de historiales médicos completada.
**¿Qué haré hoy?**
Implementar la funcionalidad de cancelar cita por parte del médico y enviar notificación (simulada/alerta).
**¿Impedimentos?**
Ninguno por el momento.

---

# Daily Scrum — Sprint 2 — Día 4

**Fecha:** 20 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Gráficos estadísticos funcionando correctamente en el panel de admin.
**¿Qué haré hoy?**
Mis HU están completas. Daré soporte al equipo para pruebas de calidad (QA) y limpieza de código.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Conexión de citas en página de paciente exitosa.
**¿Qué haré hoy?**
Finalizar el documento de Casos de Uso y Requerimientos.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
HU-008 en develop sin conflictos.
**¿Qué haré hoy?**
Hacer pruebas cruzadas agendando varias citas seguidas para romper la lógica de traslapes.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
Capturas del Kanban medio terminadas.
**¿Qué haré hoy?**
Unir las HU completas al archivo principal de documentación.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
Cancelación de citas y atención terminada.
**¿Qué haré hoy?**
Terminar el Manual de Usuario y Prototipos de las últimas pantallas desarrolladas.
**¿Impedimentos?**
Ninguno por el momento.

---

# Daily Scrum — Sprint 2 — Día 5

**Fecha:** 21 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Apoyé resolviendo bugs menores de GitFlow.
**¿Qué haré hoy?**
Preparar el entorno de Docker para que hagamos una prueba de "Clean Install" (levantar todo desde cero) para simular la calificación.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Documentación de requerimientos subida a GitHub.
**¿Qué haré hoy?**
Verificar que todas las Historias de Usuario estén aprobadas y cerradas en el Kanban.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
Pruebas exhaustivas pasadas con éxito, las citas no se traslapan.
**¿Qué haré hoy?**
Revisión general de código (Code Review) con el equipo.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
Documentación centralizada lista.
**¿Qué haré hoy?**
Ayudar en la prueba del "Clean Install" levantando Docker desde mi máquina.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
Manual de usuario completo con todas las pantallas de Citas.
**¿Qué haré hoy?**
Subir manuales finales y prepararme para la Sprint Retrospective.
**¿Impedimentos?**
Ninguno por el momento.

---

# Daily Scrum — Sprint 2 — Día 6

**Fecha:** 22 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master)

**¿Qué hice ayer?**
Prueba general con `docker-compose down -v` exitosa. Todo el sistema funciona desde cero.
**¿Qué haré hoy?**
Grabar el video de la Sprint Retrospective 2 y preparar el Release (Etiqueta) final en Git.
**¿Impedimentos?**
Ninguno, listos para la entrega.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?**
Backlog oficial cerrado.
**¿Qué haré hoy?**
Participar en la Retro 2 y revisar el empaquetado del repositorio.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?**
Code Review finalizado, sin dependencias huérfanas en Node.
**¿Qué haré hoy?**
Participar en la Retro 2.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 4: Robert - 201700870

**¿Qué hice ayer?**
Pruebas locales exitosas.
**¿Qué haré hoy?**
Subir capturas finales del Kanban terminado y participar en la Retro 2.
**¿Impedimentos?**
Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?**
Documentación subida al 100%.
**¿Qué haré hoy?**
Participar en la Retro 2 y revisar que los links de los videos estén correctos.
**¿Impedimentos?**
Ninguno por el momento.



