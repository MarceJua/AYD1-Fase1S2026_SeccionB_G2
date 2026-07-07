# ☁️ Azure Migration Architecture (Serverless PaaS)

**Objetivo:** Migrar el ecosistema SaludPlus a una arquitectura PaaS 100% Serverless con un costo objetivo de $0 (aprovechando la capa gratuita de Azure for Students), abandonando el uso de Máquinas Virtuales (IaaS) y contenedores persistentes.

## 1. Definición de Servicios

- **Frontend:** Azure Static Web Apps (SWA). Despliegue gratuito, SSL y dominio automáticos.
- **Backend:** Azure Container Apps (ACA) - Plan Consumption. Escalará a cero (Scale-to-zero) por inactividad.
- **Base de Datos:** Azure Database for PostgreSQL Flexible Server. Capa B1ms gratuita (Estudiantes). Ya NO se usa contenedor de Docker para la BD.
- **Dominio:** `saludplus360.tech` administrado por SWA y ACA.

## 2. Gestión de Datos y Cronjobs

- **Automatización:** El reseteo diario (3:00 AM) se ejecutará mediante un **Azure Container Apps Job** sin estado, reemplazando al cronjob de Linux.
- **Regla estricta:** El backend NO debe ejecutar scripts de borrado/seeding (`init.sql`) al iniciar su contenedor para evitar pérdida de datos en caso de auto-escalado horizontal.

## 3. Infraestructura y Despliegue

- **IaC:** Toda la infraestructura se define con **Terraform** (`azurerm` provider).
- **CI/CD:** GitHub Actions orquestará el empaquetado hacia GitHub Container Registry (GHCR) y el despliegue hacia Azure.
