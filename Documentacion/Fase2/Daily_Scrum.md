# Registro de Daily Scrum - SaludPlus (Fase 2)

## SPRINT 1: Core Business y Nuevos Flujos

**Fechas:** 24 de Marzo al 06 de Abril de 2026.

---

# Daily Scrum — Sprint 1 — Día 1

**Fecha:** 25 de Marzo de 2026

## Integrante 1: Marcelo - 202010367 (Scrum Master / Tech Lead)

**¿Qué hice ayer?** Realizamos la Sprint Planning 1 y distribuí las tareas en Trello enfocándonos en módulos (Seguridad, Lógica Médica, Interacciones).
**¿Qué haré hoy?** Iniciar la configuración de Nodemailer en el backend para la generación y envío de tokens (HU-202).
**¿Impedimentos?** Investigar cómo no bloquear el servidor si el envío del correo tarda unos segundos.

## Integrante 2: Carlos - 202112109 (Product Owner)

**¿Qué hice ayer?** Asignamos los Story Points a las nuevas HU y actualicé los Criterios de Aceptación.
**¿Qué haré hoy?** Apoyar a Alex estructurando las queries base en SQL para el cruce de calificaciones entre pacientes y médicos.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 3: Alex - 201907608

**¿Qué hice ayer?** Revisión de los requerimientos para el sistema de Calificaciones Cruzadas (HU-205).
**¿Qué haré hoy?** Crear el nuevo esquema de tablas en BD para las calificaciones y los endpoints para recibir el puntaje de 0 a 5.
**¿Impedimentos?** Coordinar con Roberto para asegurarnos de que el "estado" de la cita cambie correctamente a "Atendido".

## Integrante 4: Roberto - 201700870

**¿Qué hice ayer?** Participé en la Planning y tomé el módulo de Tratamientos (HU-203).
**¿Qué haré hoy?** Diseñar la estructura del formulario dinámico en React para que el médico pueda agregar N cantidad de medicamentos.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 5: Rafael - 201903887

**¿Qué hice ayer?** Revisé los lineamientos de la rúbrica sobre el manejo de PDFs en registros (HU-201).
**¿Qué haré hoy?** Modificar los formularios de registro (Frontend) para que acepten `multipart/form-data` y obliguen la carga de DPI o CV.
**¿Impedimentos?** Ninguno por el momento.

---

# Daily Scrum — Sprint 1 — Día 2

**Fecha:** 27 de Marzo de 2026

## Integrante 1: Marcelo

**¿Qué hice ayer?** Nodemailer configurado. El correo llega correctamente a TempMail con el logo de SaludPlus.
**¿Qué haré hoy?** Modificar el endpoint de Login en el Backend para que intercepte si es el primer inicio de sesión y valide el token (HU-202).
**¿Impedimentos?** Manejar correctamente los estados HTTP 403 para que el Frontend sepa cuándo desplegar el input del token.

## Integrante 2: Carlos

**¿Qué hice ayer?** Consultas SQL base terminadas.
**¿Qué haré hoy?** Empezar a definir cómo se almacenarán las categorías de denuncias (HU-206) en la base de datos (Catálogo vs Enum).
**¿Impedimentos?** Ninguno por el momento.

## Integrante 3: Alex

**¿Qué hice ayer?** Endpoints de calificaciones listos.
**¿Qué haré hoy?** Programar el UI en React: las estrellas interactivas y el área de texto para que el paciente califique al médico.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 4: Roberto

**¿Qué hice ayer?** Formulario dinámico de medicamentos creado en el Frontend.
**¿Qué haré hoy?** Crear el endpoint en el Backend para recibir el array de medicamentos y guardarlos asociados a la cita.
**¿Impedimentos?** Actualizar el script `init.sql` para que todos tengan la nueva tabla `tratamientos_medicamentos`.

## Integrante 5: Rafael

**¿Qué hice ayer?** Formularios modificados para aceptar PDFs.
**¿Qué haré hoy?** Actualizar la lógica con Axios para enviar el archivo correctamente al endpoint de registro.
**¿Impedimentos?** La validación del peso del archivo me está dando problemas en React.

---

# Daily Scrum — Sprint 1 — Día 3

**Fecha:** 30 de Marzo de 2026

## Integrante 1: Marcelo

**¿Qué hice ayer?** Lógica de token y validación Backend terminada.
**¿Qué haré hoy?** Conectar la lógica Backend con los componentes `LoginPaciente.jsx` y `LoginMedico.jsx` creados en la Fase 1.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 2: Carlos

**¿Qué hice ayer?** Definimos un Enum en la BD para las categorías de denuncias.
**¿Qué haré hoy?** Comenzar a documentar las nuevas Historias de Usuario en detalle en el archivo Markdown.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 3: Alex

**¿Qué hice ayer?** Componente de estrellas interactivo terminado.
**¿Qué haré hoy?** Iniciar con el Backend para el Sistema de Reportes/Denuncias (HU-206).
**¿Impedimentos?** Ninguno por el momento.

## Integrante 4: Roberto

**¿Qué hice ayer?** Endpoint de guardado de tratamientos funcional.
**¿Qué haré hoy?** Iniciar investigación sobre cómo generar PDFs desde Node.js o React para la Receta del Paciente (HU-204).
**¿Impedimentos?** Decidir entre usar `jspdf` en el cliente o generarlo en el servidor.

## Integrante 5: Rafael

**¿Qué hice ayer?** Solucioné el peso del archivo y los registros ya suben PDFs al servidor local.
**¿Qué haré hoy?** Revisar el diseño de la vista de "Aceptar Usuarios" del administrador para prepararla para el visor de PDFs (HU-207).
**¿Impedimentos?** Ninguno por el momento.

---

# Daily Scrum — Sprint 1 — Día 4

**Fecha:** 01 de Abril de 2026

## Integrante 1: Marcelo

**¿Qué hice ayer?** Integración Full-Stack de HU-202 completada. El flujo de validación con Token funciona perfecto.
**¿Qué haré hoy?** Haré Code Review a los PRs de Rafael (Archivos) para unirlos a `develop`.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 2: Carlos

**¿Qué hice ayer?** Historias de usuario detalladas en la documentación.
**¿Qué haré hoy?** Tomar las capturas del Kanban de medio sprint y actualizar los Requerimientos F/NF.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 3: Alex

**¿Qué hice ayer?** Endpoint de reportes creado.
**¿Qué haré hoy?** Crear el Modal (UI) con el ComboBox para que el usuario pueda enviar el reporte desde su historial.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 4: Roberto

**¿Qué hice ayer?** Decidimos usar `jspdf` para generar el documento en el navegador.
**¿Qué haré hoy?** Diseñar el layout del PDF de la receta (Encabezado de clínica y firmas) usando autoTable.
**¿Impedimentos?** Alinear correctamente los datos del médico colegiado en el pie del PDF.

## Integrante 5: Rafael

**¿Qué hice ayer?** Vista del administrador ajustada para recibir el layout de 2 columnas.
**¿Qué haré hoy?** Darle soporte a Alex y Roberto con estilos CSS para sus nuevos modales y tablas.
**¿Impedimentos?** Ninguno por el momento.

---

# Daily Scrum — Sprint 1 — Día 5

**Fecha:** 03 de Abril de 2026

## Integrante 1: Marcelo

**¿Qué hice ayer?** Code Review de archivos listo. `develop` está estable.
**¿Qué haré hoy?** Iniciar a planificar la HU-211 (CI/CD) creando la estructura `.github/workflows` en mi rama local.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 2: Carlos

**¿Qué hice ayer?** Documentación de requerimientos subida.
**¿Qué haré hoy?** Apoyar probando exhaustivamente que los médicos no puedan calificar a pacientes de citas "Canceladas".
**¿Impedimentos?** Ninguno por el momento.

## Integrante 3: Alex

**¿Qué hice ayer?** Modal de reportes terminado y conectado al backend. HU-205 y HU-206 completas.
**¿Qué haré hoy?** Actualizar el Diagrama Entidad-Relación y el Diagrama de Casos de Uso con los nuevos flujos.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 4: Roberto

**¿Qué hice ayer?** Generación del PDF de receta finalizado. El paciente ya puede descargar su tratamiento (HU-204).
**¿Qué haré hoy?** Pulir código y hacer mis Pull Requests hacia `develop`.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 5: Rafael

**¿Qué hice ayer?** Estilos CSS pulidos en modales.
**¿Qué haré hoy?** Actualizar el Manual de Usuario con capturas de las nuevas funcionalidades (Recetas, Calificar, Subir PDF).
**¿Impedimentos?** Ninguno por el momento.

---

# Daily Scrum — Sprint 1 — Día 6

**Fecha:** 06 de Abril de 2026

## Equipo Completo (Pre-Retrospectiva)

**¿Qué hicimos ayer?** Todas las HU del Sprint 1 (Seguridad, Recetas, Reportes) fueron integradas en `develop` y probadas en conjunto.
**¿Qué haremos hoy?** Realizar la Sprint Retrospective 1 (grabar el video) y planificar las HU de Administración y DevOps para el Sprint 2 y generar el Release Tag `v2.1.0` en GitHub
**¿Impedimentos?** Ninguno, Sprint 1 cerrado con éxito.

---

---

## SPRINT 2: Administración, Calidad y DevOps

**Fechas:** 07 de Abril al 20 de Abril de 2026.

---

# Daily Scrum — Sprint 2 — Día 1

**Fecha:** 09 de Abril de 2026

## Integrante 1: Marcelo

**¿Qué hice ayer?** Cerramos Sprint 1 y tuvimos la Planning 2.
**¿Qué haré hoy?** Avanzar en la HU-211. Configurar las variables encriptadas (Secrets) en GitHub para el pipeline CI/CD.
**¿Impedimentos?** Ajustar el `docker-compose.yml` para que el backend reconozca las variables falsas del runner sin fallar.

## Integrante 2: Carlos

**¿Qué hice ayer?** Asumí las HU-208 y HU-209 para el panel de Admin.
**¿Qué haré hoy?** Crear las vistas en React para que el Admin pueda leer las denuncias hechas por usuarios.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 3: Alex

**¿Qué hice ayer?** Diagramas actualizados y subidos a documentación.
**¿Qué haré hoy?** Apoyar a Carlos creando los endpoints en el backend para consultar los promedios de calificación de cada médico.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 4: Roberto

**¿Qué hice ayer?** Código de tratamientos estabilizado en `develop`.
**¿Qué haré hoy?** Instalar e inicializar Cypress en el proyecto para comenzar con la HU-210 (Pruebas E2E).
**¿Impedimentos?** Entender cómo simular el login desde Cypress sin romper la base de datos de pruebas.

## Integrante 5: Rafael

**¿Qué hice ayer?** Preparé entorno para mi HU-207.
**¿Qué haré hoy?** Implementar el Visor de PDF incrustado usando `<iframe>` en el panel de administrador.
**¿Impedimentos?** Asegurarme de que la ruta de Express permita servir archivos estáticos desde la carpeta `uploads`.

---

# Daily Scrum — Sprint 2 — Día 2

**Fecha:** 12 de Abril de 2026

## Integrante 1: Marcelo

**¿Qué hice ayer?** Variables Secrets configuradas en GitHub Actions.
**¿Qué haré hoy?** Escribir los `jobs` en el YAML para compilar las imágenes y levantar los servicios con un Health Check.
**¿Impedimentos?** Descubrí que la nueva versión requiere usar `docker compose` sin guion.

## Integrante 2: Carlos

**¿Qué hice ayer?** Vista de lectura de denuncias creada.
**¿Qué haré hoy?** Implementar los botones para "Rechazar denuncia" o "Dar de baja" consumiendo los endpoints de la Fase 1.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 3: Alex

**¿Qué hice ayer?** Endpoint de promedios de calificación funcional.
**¿Qué haré hoy?** Empezar a crear los endpoints estadísticos (GROUP BY) para alimentar los gráficos de Carlos (HU-209).
**¿Impedimentos?** Ninguno por el momento.

## Integrante 4: Roberto

**¿Qué hice ayer?** Entorno Cypress configurado con éxito.
**¿Qué haré hoy?** Escribir las 5 pruebas Unitarias usando Jest/Mocha para los controladores del Backend (Login y Tratamientos).
**¿Impedimentos?** Ninguno por el momento.

## Integrante 5: Rafael

**¿Qué hice ayer?** Solucioné el acceso estático en Node.js para los archivos.
**¿Qué haré hoy?** Terminar la HU-207. El `iframe` ya renderiza el PDF del DPI del paciente al lado de sus datos.
**¿Impedimentos?** Ninguno por el momento.

---

# Daily Scrum — Sprint 2 — Día 3

**Fecha:** 14 de Abril de 2026

## Integrante 1: Marcelo

**¿Qué hice ayer?** Pipeline CI/CD funcional. Logré el primer "Cheque Verde" en GitHub.
**¿Qué haré hoy?** Iniciar el despliegue del Frontend dockerizado usando DigitalOcean App Platform / S3.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 2: Carlos

**¿Qué hice ayer?** Panel de gestión de reportes (HU-208) completado.
**¿Qué haré hoy?** Integrar la librería Chart.js y graficar los datos analíticos para la HU-209.
**¿Impedimentos?** Mapear correctamente los arrays de datos al formato que pide la librería gráfica.

## Integrante 3: Alex

**¿Qué hice ayer?** Endpoints estadísticos completados y probados.
**¿Qué haré hoy?** Escribir Pruebas Unitarias para mis controladores de Calificaciones y Reportes para apoyar a Roberto con la cuota mínima.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 4: Roberto

**¿Qué hice ayer?** 3 Pruebas Unitarias listas.
**¿Qué haré hoy?** Terminar las unitarias e iniciar a escribir los scripts de Cypress para simular el flujo de Agendar Cita (E2E).
**¿Impedimentos?** Cypress es muy rápido y a veces los elementos de React aún no cargan; debo usar timeouts.

## Integrante 5: Rafael

**¿Qué hice ayer?** HU-207 completada. Visor PDF funcional para médicos y pacientes.
**¿Qué haré hoy?** Iniciar la actualización de prototipos UI finales en Figma y capturas para el Manual.
**¿Impedimentos?** Ninguno por el momento.

---

# Daily Scrum — Sprint 2 — Día 4

**Fecha:** 16 de Abril de 2026

## Integrante 1: Marcelo

**¿Qué hice ayer?** Frontend compilado (`npm run build`) y listo para subir a la nube.
**¿Qué haré hoy?** Configurar el Bucket público en AWS S3 para tener la URL final de despliegue.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 2: Carlos

**¿Qué hice ayer?** Gráficos de Chart.js renderizando correctamente (HU-209).
**¿Qué haré hoy?** Cargar datos de prueba (Mocks) en la BD para que las gráficas se vean robustas al momento de calificar.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 3: Alex

**¿Qué hice ayer?** Pruebas unitarias de mis módulos entregadas.
**¿Qué haré hoy?** Escribir scripts Cypress para probar el flujo de Calificar a un Médico.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 4: Roberto

**¿Qué hice ayer?** 2 Pruebas E2E funcionales.
**¿Qué haré hoy?** Completar las Pruebas E2E faltantes y empezar el archivo `Pruebas_Calidad.md`.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 5: Rafael

**¿Qué hice ayer?** Prototipos finales subidos.
**¿Qué haré hoy?** Darle una última pasada a todo el CSS de los Dashboards para que la plataforma se vea profesional.
**¿Impedimentos?** Ninguno por el momento.

---

# Daily Scrum — Sprint 2 — Día 5

**Fecha:** 19 de Abril de 2026

## Integrante 1: Marcelo

**¿Qué hice ayer?** HU-211 Completada. Tenemos CI/CD verde y Frontend en S3.
**¿Qué haré hoy?** Como Scrum Master, redactaré mi Evaluación del Equipo y actualizaré el `ManualTecnico.md` con los diagramas de arquitectura CI/CD (Mermaid).
**¿Impedimentos?** Ninguno por el momento.

## Integrante 2: Carlos

**¿Qué hice ayer?** Mocks subidos. La plataforma tiene datos para los reportes.
**¿Qué haré hoy?** Tomar capturas finales del Kanban en Trello para cerrar el Sprint y actualizar Requerimientos.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 3: Alex

**¿Qué hice ayer?** Pruebas Cypress aportadas a Roberto.
**¿Qué haré hoy?** Revisión de la base de datos final. Asegurarme de que el `init.sql` en GitHub esté 100% actualizado.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 4: Roberto

**¿Qué hice ayer?** 5 Unitarias y 5 E2E completas (HU-210 Finalizada).
**¿Qué haré hoy?** Llenar el documento `Pruebas_Calidad.md` detallando los 10 casos probados y subir las capturas de pantalla de Cypress en verde.
**¿Impedimentos?** Ninguno por el momento.

## Integrante 5: Rafael

**¿Qué hice ayer?** Mejoras de UI finalizadas.
**¿Qué haré hoy?** Completar el Manual de Usuario con las funciones del Administrador (Visor y Gráficas).
**¿Impedimentos?** Ninguno por el momento.

---

# Daily Scrum — Sprint 2 — Día 6

**Fecha:** 24 de Abril de 2026

## Equipo Completo (Pre-Retrospectiva Final)

**¿Qué hicimos ayer?** Todas las tareas de DevOps, Pruebas y Documentación fueron entregadas. Hemos consolidado el código y el pipeline en GitHub Actions pasó exitosamente tras el merge a `main`.
**¿Qué haremos hoy?** Realizar la Sprint Retrospective 2 (video final), grabar demostraciones de flujos en caso de que el CI/CD tarde en la calificación, y generar el Release Tag `v2.2.0` en GitHub.
**¿Impedimentos?** Ninguno, Proyecto Fase 2 finalizado.
