# AYD1-Fase1S2026_SeccionB_G2

## HU-001: Registro e Inicio de Sesión de Paciente

### Comandos utilizados:

bcryptjs permite la encriptación de las contraseñas
jsonwebtoken genera el token de inicio de sesión
npm install bcryptjs jsonwebtoken

# HU-002 Resumen de Acciones Realizadas

## 1. Base de Datos (Persistencia)

- **Creación de Tabla:** Se diseñó y ejecutó el script SQL para la tabla `medicos`, incluyendo campos específicos:
  - `numero_colegiado`, `especialidad`, `foto` y `estado` (por defecto 'pendiente').
- **Automatización:** Creación del archivo `database/init.sql` y configuración en `docker-compose.yml` para inicialización automática en Windows/Linux.
- **Mapeo de Volúmenes:** Configuración de persistencia para evitar pérdida de datos al apagar contenedores.

---

# HU-004 Resumen de Acciones Realizadas

## 1. Registro y accesos para usuario administrador
* **Creación de Tabla:** Se diseñó y ejecutó el script SQL para la tabla `administradores`, incluyendo campos específicos:
    * `usuario, contrasenia
* **Validacion y seguridad:** Se implementaron validaciones para el registro y login de usuarios administradores. incluyendo un sistema de autenticacion y validacion de password encriptado mediante un archivo txt.


---

## 2. Backend (Lógica de Negocio)

- **Gestión de Archivos (Multer):** Implementación de middleware para subida de archivos usando rutas absolutas con el módulo `path` (Compatibilidad Multiplataforma).
- **Controlador de Autenticación:**
  - `registrarMedico`: Validación de fotografía obligatoria y encriptación con **bcryptjs**.
  - `loginMedico`: Validación crítica; solo permite el ingreso si el estado es `'aprobado'` (Error 403 en caso contrario).
- **Rutas de API:** Integración de endpoints `/medico/registro` y `/medico/login`.

---

## 3. Frontend (Interfaz de Usuario)

- **Componentes Creados:**
  - `RegistroMedico.jsx`: Formulario con `FormData` para envío de archivos físicos.
  - `SeleccionRol.jsx`: Interfaz de decisión para registro de Paciente o Médico.
- **Navegación:** Redirecciones automáticas con `useNavigate`.
- **UI/UX:** Adaptación de estilos CSS para mantener consistencia visual entre los formularios de médico y paciente.

---

## Problemas Arreglados (Bugs & Fixes)

| Problema | Causa Raíz | Solución Aplicada |
| :--- | :--- | :--- |
| **Página en blanco** | Referencias a `Link` no importadas. | Importación de `react-router-dom` y limpieza de caché de Vite. |
| **Error de Crypto** | Versión de Node antigua en Docker. | Actualización de imagen base y limpieza de volúmenes. |
| **ReferenceError** | `loginMedico` no exportado. | Se agregó al `module.exports` del controlador. |
| **ERR_CONNECTION_REFUSED** | Errores de sintaxis en el Backend. | Depuración de logs y reinicio de contenedores. |
| **Relation "medicos" does not exist** | Tabla no creada tras limpiar Docker. | Automatización mediante `init.sql`. |
| **Fotos no guardadas** | Rutas relativas conflictivas. | Uso de `path.join(__dirname, ...)` y mapeo de volúmenes. |

---

# HU-009 Resumen de Acciones Realizadas

## 1. Base de Datos (Persistencia)
* **Creación de Tablas:** Se agregaron dos tablas nuevas al script `database/init.sql`:
    * `citas`: almacena citas médicas con campos `medico_id`, `paciente_id`, `fecha`, `hora` y `estado`.
    * `horario_medico`: almacena el horario de cada médico con `medico_id` (UNIQUE), `dias` (TEXT[]), `hora_inicio` y `hora_fin`. La restricción UNIQUE garantiza que cada médico tenga exactamente un horario.

---

## 2. Backend (Lógica de Negocio)
* **Middleware de Autenticación:** Se creó `verifyMedicoToken.js` para proteger los endpoints del médico, validando el JWT con rol `'medico'`.
* **Controlador de Horarios (`horarioController.js`):**
    * `obtenerHorario`: Retorna el horario actual del médico o `null` si aún no tiene uno configurado.
    * `guardarHorario`: Inserta el horario por primera vez. Retorna 409 si ya existe.
    * `actualizarHorario`: Actualiza el horario con validación crítica — si hay citas activas/pendientes fuera del nuevo rango horario, **no se permite la actualización** y se devuelven las citas conflictivas.
* **Rutas de API (`medicoRoutes.js`):** Se registraron tres endpoints bajo `/api/medico/horarios`:
    * `GET /api/medico/horarios` → obtener horario actual
    * `POST /api/medico/horarios` → guardar horario por primera vez
    * `PUT /api/medico/horarios` → actualizar horario (con validación de citas)

---

## 3. Frontend (Interfaz de Usuario)
* **Componente Creado:**
    * `HorarioMedico.jsx`: Vista con checkboxes para seleccionar días (Lunes–Domingo), inputs `type="time"` para hora inicio y fin, y botón dinámico que muestra **"Guardar horario"** si es la primera vez o **"Actualizar horario"** si ya existe un horario. Muestra la lista de citas conflictivas si el backend responde 409.
* **Navegación:** Se registró la ruta `/horario-medico` en `App.jsx` y se corrigió el redirect del login del médico para apuntar a esta vista en lugar del dashboard del paciente.

---

# HU-013 Resumen de Acciones Realizadas

## 1. Base de Datos (Persistencia)
* **Sin cambios de esquema:** Se reutilizó la tabla `medicos` definida en `database/init.sql`. Los campos requeridos por la historia (`nombre`, `apellido`, `dpi`, `fecha_nacimiento`, `genero`, `direccion`, `telefono`, `foto`, `numero_colegiado`, `especialidad`, `direccion_clinica`, `correo`) ya estaban presentes.

---

## 2. Backend (Lógica de Negocio)
* **Controlador de Perfil (`perfilMedicoController.js`):**
    * `obtenerPerfilMedico`: Retorna todos los campos del médico autenticado (excluye contraseña). Usa el `id` extraído del JWT por el middleware.
    * `actualizarPerfilMedico`: Actualiza todos los campos editables. El campo `correo` es ignorado aunque se envíe en el cuerpo. Si se adjunta una nueva fotografía, elimina la anterior del disco y almacena la nueva.
* **Rutas de API (`medicoRoutes.js`):** Se registraron dos endpoints nuevos bajo `/api/medico/perfil`, ambos protegidos con `verifyMedicoToken`:
    * `GET /api/medico/perfil` → obtener perfil del médico autenticado
    * `PUT /api/medico/perfil` → actualizar perfil (foto opcional vía `multipart/form-data`)
* **Validaciones:** Unicidad de `dpi` y `numero_colegiado` manejada por restricciones de la base de datos; retorna error 400 con mensaje descriptivo si se detecta colisión.

---

## 3. Frontend (Interfaz de Usuario)
* **Componente Creado:**
    * `PerfilMedico.jsx`: Formulario con todos los campos del médico precargados desde `GET /api/medico/perfil`. El campo `correo` se muestra deshabilitado (solo lectura). Incluye previsualización de fotografía actual y selector para reemplazarla. Muestra mensajes de éxito o error según la respuesta del backend.
* **Flujo de Navegación Actualizado:**
    * `LoginMedico.jsx`: Tras el login exitoso, consulta `GET /api/medico/horarios`. Si el médico ya tiene horario configurado, redirige directamente a `/perfil-medico`; si no, redirige a `/horario-medico`.
    * `HorarioMedico.jsx`: Al guardar o actualizar el horario exitosamente, redirige automáticamente a `/perfil-medico` tras 1.5 segundos.
    * `PerfilMedico.jsx`: Incluye botón **"Editar Horario Medico"** que navega a `/horario-medico` y botón **"Cerrar Sesion"** que limpia el token del `localStorage` y redirige a `/login-medico`.
* **Ruta registrada:** `/perfil-medico` añadida en `App.jsx`.
