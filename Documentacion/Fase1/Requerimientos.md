# Requerimientos del Sistema - SaludPlus

## 1. Requerimientos Funcionales (RF)

Son las acciones específicas que el sistema permite realizar a los usuarios.

- **RF-01 Gestión de Acceso:** El sistema debe permitir el registro e inicio de sesión seguro para tres tipos de roles: Paciente, Médico y Administrador.
- **RF-02 Panel de Administración:** El sistema debe permitir al Administrador aprobar o rechazar solicitudes de registro de nuevos médicos y pacientes, así como darlos de baja.
- **RF-03 Catálogo y Búsqueda:** El sistema debe mostrar a los pacientes un catálogo de médicos aprobados y permitir la búsqueda/filtrado por especialidad médica.
- **RF-04 Gestión de Horarios:** El sistema debe permitir a los médicos configurar sus días y horas de atención disponible.
- **RF-05 Programación de Citas:** El sistema debe permitir a los pacientes agendar una cita validando que no existan traslapes de horarios ni duplicidad con el mismo médico.
- **RF-06 Historial y Cancelaciones:** El sistema debe permitir a pacientes y médicos visualizar sus citas activas, su historial de atención y cancelar citas (cumpliendo la regla de las 24 horas de anticipación).
- **RF-07 Reportes Analíticos:** El sistema debe generar reportes gráficos para el Administrador (ej. Médicos con más citas atendidas, Especialidades más solicitadas).

---

## 2. Requerimientos No Funcionales (RNF)

Son las restricciones técnicas, de seguridad y de arquitectura del sistema.

- **RNF-01 Seguridad y Autenticación:** Las contraseñas deben estar encriptadas utilizando `bcryptjs` y la gestión de sesiones debe realizarse mediante tokens `JWT` (JSON Web Tokens).
- **RNF-02 Arquitectura de Software:** El sistema debe estar desarrollado bajo una arquitectura Cliente-Servidor, separando el Frontend (React/Vite) del Backend (Node.js/Express).
- **RNF-03 Persistencia de Datos:** La información debe almacenarse en una base de datos relacional PostgreSQL.
- **RNF-04 Despliegue y Contenedores:** La base de datos (y la aplicación) debe estar dockerizada mediante un archivo `docker-compose.yml` para garantizar la compatibilidad entre entornos.
- **RNF-05 Manejo de Archivos:** El sistema debe soportar la carga y almacenamiento físico de imágenes de perfil utilizando middlewares como `Multer` y resolviendo las rutas de forma estática.
