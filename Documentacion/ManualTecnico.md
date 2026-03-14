# Manual Técnico

## 1. Arquitectura de Contenedores (Docker)

El proyecto "SaludPlus" está diseñado bajo una arquitectura de microservicios contenedorizados utilizando **Docker** y orquestados mediante **Docker Compose**. Esto garantiza que la aplicación funcione de manera idéntica en cualquier entorno de desarrollo o evaluación, eliminando el problema de dependencias y versiones locales.

La arquitectura se compone de tres contenedores principales interconectados en una red interna de Docker:

1. **Contenedor de Base de Datos (`saludplus_db`):** \* Utiliza la imagen oficial de `postgres:15-alpine`.
   - Expone el puerto `5432`.
   - Implementa un volumen persistente (`pgdata`) para evitar la pérdida de información médica y credenciales al apagar el contenedor.
   - Se inicializa automáticamente con la estructura de tablas a través del script `database/init.sql`.
2. **Contenedor del Backend (`saludplus_backend`):**
   - Construido sobre la imagen `node:18-alpine` o `node:20-alpine`.
   - Expone el puerto `5000`.
   - Contiene la API REST desarrollada en Express.js y se comunica internamente con el contenedor de la base de datos.
   - Maneja un volumen local para la carpeta `uploads`, asegurando que las fotografías de los médicos y pacientes persistan y se sincronicen con el sistema anfitrión.
3. **Contenedor del Frontend (`saludplus_frontend`):**
   - Construido sobre la imagen de `node` optimizada para Vite y React.
   - Expone el puerto `5173`.
   - Consume los servicios del Backend utilizando variables de entorno (`VITE_API_URL`) configuradas para apuntar a la red local.

---

## 2. Requisitos Previos (Prerrequisitos)

Para ejecutar el proyecto en cualquier máquina, es estrictamente necesario contar con las siguientes herramientas instaladas:

- **Docker Desktop** (Asegurarse de que el motor/Daemon esté en ejecución).
- **Git** (Para clonar el repositorio).
- Puertos `5000`, `5173` y `5432` libres en la máquina anfitriona.

---

## 3. Guía de Despliegue (Cómo levantar el proyecto)

Para inicializar la plataforma SaludPlus desde cero, siga estos pasos en su terminal:

**Paso 1: Clonar el repositorio y acceder a la carpeta raíz**

Bash

```jsx
git clone https://github.com/MarceJua/AYD1-Fase1S2026_SeccionB_G2.git
cd AYD1-Fase1S2026_SeccionB_G2
```

**Paso 2: Construir y levantar los contenedores**
El siguiente comando leerá el archivo `docker-compose.yml`, descargará las imágenes necesarias, instalará las dependencias de Node.js y levantará los tres servicios simultáneamente.

Bash

```jsx
docker-compose up --build
```

> _Nota: Si se desea correr en segundo plano (detached mode), se puede agregar la bandera `-d` al final del comando._

**Paso 3: Acceso a la aplicación**
Una vez que la consola indique que los servidores están listos, se puede acceder a través de cualquier navegador web:

- **Portal de Usuarios:** `http://localhost:5173/login`
- **Portal de Administrador:** `http://localhost:5173/admin-login`

---

## 4. Comandos Útiles de Mantenimiento

Para la gestión diaria del proyecto, se recomiendan los siguientes comandos en la raíz del proyecto:

- **Apagar el proyecto sin perder datos:**
  Bash
  ```jsx
  docker-compose down
  ```
- **Reinicio limpio (Destruir Base de Datos):** Si se requiere probar el proyecto desde cero y volver a ejecutar el script `init.sql`, se deben destruir los volúmenes con la bandera `v`.
  Bash
  ```jsx
  docker-compose down -v
  docker-compose up --build
  ```
- **Ver registros (Logs) en caso de errores:**
  ```jsx
  docker logs saludplus_backend
  ```

---
