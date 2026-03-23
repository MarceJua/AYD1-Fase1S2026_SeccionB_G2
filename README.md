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

| Problema                              | Causa Raíz                           | Solución Aplicada                                              |
| :------------------------------------ | :----------------------------------- | :------------------------------------------------------------- |
| **Página en blanco**                  | Referencias a `Link` no importadas.  | Importación de `react-router-dom` y limpieza de caché de Vite. |
| **Error de Crypto**                   | Versión de Node antigua en Docker.   | Actualización de imagen base y limpieza de volúmenes.          |
| **ReferenceError**                    | `loginMedico` no exportado.          | Se agregó al `module.exports` del controlador.                 |
| **ERR_CONNECTION_REFUSED**            | Errores de sintaxis en el Backend.   | Depuración de logs y reinicio de contenedores.                 |
| **Relation "medicos" does not exist** | Tabla no creada tras limpiar Docker. | Automatización mediante `init.sql`.                            |
| **Fotos no guardadas**                | Rutas relativas conflictivas.        | Uso de `path.join(__dirname, ...)` y mapeo de volúmenes.       |
