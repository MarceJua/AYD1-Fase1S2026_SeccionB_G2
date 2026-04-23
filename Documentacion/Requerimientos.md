# Requerimientos del Sistema - SaludPlus

## 1. Requerimientos Funcionales (RF)

Son las acciones específicas que el sistema permite realizar a los usuarios.

- **RF-01 Gestión de Acceso y Seguridad:** El sistema debe permitir el registro e inicio de sesión seguro para tres tipos de roles (Paciente, Médico y Administrador). El registro debe requerir la carga obligatoria de documentos (DPI para pacientes, CV y foto para médicos) y validar el correo electrónico del usuario mediante un Token de verificación antes del primer inicio de sesión.
- **RF-02 Panel de Administración:** El sistema debe permitir al Administrador visualizar documentos incrustados (PDFs), aprobar o rechazar solicitudes de registro, así como gestionar bajas de usuarios activos.
- **RF-03 Catálogo y Búsqueda:** El sistema debe mostrar a los pacientes un catálogo de médicos aprobados y permitir la búsqueda/filtrado por especialidad médica.
- **RF-04 Gestión de Horarios:** El sistema debe permitir a los médicos configurar sus días y horas de atención disponible.
- **RF-05 Programación de Citas:** El sistema debe permitir a los pacientes agendar una cita validando que no existan traslapes de horarios ni duplicidad con el mismo médico.
- **RF-06 Historial, Tratamientos y Cancelaciones:** El sistema debe permitir a pacientes y médicos visualizar sus citas activas y su historial. Los médicos deben poder registrar diagnósticos y recetas estructuradas (medicamentos y dosis) al atender una cita. Los pacientes podrán cancelar citas (con 24 hrs de anticipación) y descargar sus recetas en formato PDF.
- **RF-07 Interacción y Reportes de Usuarios:** El sistema debe permitir un sistema de calificaciones cruzadas (estrellas y comentarios) y denuncias categorizadas entre médicos y pacientes, aplicable únicamente a citas en estado "Atendido".
- **RF-08 Reportes Analíticos e Insights:** El sistema debe generar reportes gráficos avanzados para el Administrador (ej. Médicos con más citas, Especialidades solicitadas, Franjas horarias más demandadas y Cancelaciones por especialidad).

---

## 2. Requerimientos No Funcionales (RNF)

Son las restricciones técnicas, de seguridad y de arquitectura del sistema.

- **RNF-01 Seguridad y Autenticación:** Las contraseñas deben estar encriptadas utilizando `bcryptjs` y la gestión de sesiones debe realizarse mediante tokens `JWT` (JSON Web Tokens). Se debe implementar validación de correo vía SMTP (Nodemailer).
- **RNF-02 Arquitectura de Software:** El sistema debe estar desarrollado bajo una arquitectura Cliente-Servidor, separando el Frontend (React/Vite) del Backend (Node.js/Express).
- **RNF-03 Persistencia de Datos:** La información debe almacenarse en una base de datos relacional PostgreSQL.
- **RNF-04 Despliegue y Contenedores:** La base de datos (y la aplicación para desarrollo local) debe estar dockerizada mediante un archivo `docker-compose.yml`. El despliegue final en la nube debe automatizarse usando pipelines de CI/CD (GitHub Actions).
- **RNF-05 Manejo de Archivos:** El sistema debe soportar la carga, validación (solo `.pdf` o imágenes) y almacenamiento físico de documentos utilizando middlewares como `Multer`, permitiendo su visualización mediante etiquetas `<iframe/>`.
- **RNF-06 Calidad de Software:** El sistema debe asegurar su estabilidad mediante la implementación de pruebas automatizadas, incluyendo pruebas Unitarias (backend) y pruebas End-to-End (E2E con herramientas como Cypress o Selenium) simulando la interfaz de usuario.
