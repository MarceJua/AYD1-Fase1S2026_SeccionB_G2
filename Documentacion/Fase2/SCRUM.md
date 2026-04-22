# **Gestión de Proyecto SCRUM - SaludPlus (Fase 2)**

_Este documento centraliza la gestión ágil del proyecto, ceremonias, y evaluación del equipo, cumpliendo con los lineamientos del auxiliar para la Fase 2._

---

## **1. Creación de Product Backlog (Fase 2)**

**[Responsable: Carlos - Product Owner]**

**Módulo 1: Seguridad y Archivos**

- **HU-201 Modificación de Registro con Archivos PDF:** Registro obligatorio de DPI (PDF) para pacientes y CV (PDF) + foto para médicos.
- **HU-202 Validación de Correo con Token:** Generación de token único enviado vía email (Nodemailer) y validación obligatoria en el primer inicio de sesión.

**Módulo 2: Tratamientos y Recetas**

- **HU-203 Tratamiento Estructurado Médico:** Formulario para agregar diagnóstico y múltiples medicamentos (nombre, cantidad, tiempo, dosis) al atender una cita.
- **HU-204 Visualización y Receta PDF Paciente:** Generación de PDF descargable de la receta con datos del médico colegiado.

**Módulo 3: Calificaciones y Reportes**

- **HU-205 Sistema de Calificaciones Cruzadas:** Calificación mutua (0-5 estrellas + comentarios) entre paciente y médico, exclusivo para citas "Atendidas".
- **HU-206 Sistema de Reportes/Denuncias:** Envío de reportes con categorías predefinidas y descripción en citas atendidas.

**Módulo 4: Evolución del Administrador**

- **HU-207 Visor PDF Incrustado:** Visualización de PDFs (DPI/CV) mediante `<iframe>` o `<embed>` en el panel de aprobación de usuarios.
- **HU-208 Gestión de Reportes y Calificaciones:** Panel para revisar denuncias y promedios, con opciones para rechazar denuncia o dar de baja al usuario.
- **HU-209 Reportes Analíticos Nuevos:** Dos gráficos adicionales con Chart.js (ej. horarios demandados, cancelaciones).

**Módulo 5: Calidad y DevOps**

- **HU-210 Pruebas E2E y Unitarias:** Implementación de mínimo 5 pruebas unitarias y 5 pruebas E2E (Cypress).
- **HU-211 CI/CD y Despliegue Cloud:** Pipeline en GitHub Actions (Build, Test, Deploy en Runner) y despliegue del frontend estático en AWS S3.

---

## **2. Sprint Planning**

### **Sprint Planning 1: Core Business y Nuevos Flujos**

- **Fecha:** 24 de Marzo de 2026
- **Plataforma:** Google Meet
- **Grabación:** [Insertar enlace a Google Drive]
- **Fin Sprint 1:** 06/04/2026

**Roles Presentes:**

- Scrum Master: Marcelo (202010367)
- Product Owner: Carlos
- Dev Team: Rafael, Roberto, Alex

**Sprint Goal (Objetivo del Sprint 1):**
Implementar todas las nuevas medidas de seguridad en los registros (PDFs y Token) y finalizar la lógica transaccional de los usuarios (Tratamientos, Recetas, Calificaciones y Reportes).

**Historias Abordadas:** HU-201, HU-202, HU-203, HU-204, HU-205, HU-206.

---

### **Sprint Planning 2: Administración, Calidad y DevOps**

- **Fecha:** 07 de Abril de 2026
- **Plataforma:** Google Meet
- **Grabación:** [Insertar enlace a Google Drive]
- **Fin Sprint 2:** 20/04/2026

**Roles Presentes:**

- Scrum Master: Marcelo (202010367)
- Product Owner: Carlos
- Dev Team: Rafael, Roberto, Alex

**Sprint Goal (Objetivo del Sprint 2):**
Finalizar el panel del Administrador con el visor de PDFs y reportes gráficos, asegurar la calidad del software mediante pruebas automatizadas y desplegar el proyecto en la nube utilizando CI/CD.

**Historias Abordadas:** HU-207, HU-208, HU-209, HU-210, HU-211.

---

## **3. Sprint Backlog e Historias de Usuario**

**[Responsable: Carlos]**
_Las Historias de Usuario completas con criterios de aceptación se han documentado a detalle en un archivo separado._

**[Ver Documento Completo de Historias de Usuario](./Historias_de_Usuario.md)**

---

## **4. Daily Scrum**

**[Responsable: Marcelo (Scrum Master)]**
Se documentaron 12 Daily Scrums en total (6 por Sprint), respondiendo las preguntas: ¿Qué hice ayer?, ¿Qué haré hoy?, ¿Impedimentos?.

**[Ver Registro Completo de Daily Scrums](./Daily_Scrum.md)**

---

## **5. Sprint Retrospective**

### **Retrospectiva Sprint 1**

- **Fecha:** 06 de Abril de 2026
- **Grabación:** [Insertar enlace a Google Drive]
- **Resumen:**
  1.  **¿Qué se hizo BIEN durante el Sprint?** La delegación de tareas por módulos ("Lógica Médica" para Roberto, "Seguridad" para Marcelo) permitió trabajar en paralelo sin demasiados conflictos de Git. La modificación del esquema de la base de datos se planificó correctamente desde el inicio.
  2.  **¿Qué se hizo MAL durante el Sprint?** Hubo retrasos iniciales al configurar el envío de correos y la estructura de la base de datos para soportar múltiples medicamentos por receta.
  3.  **¿Qué MEJORAS implementaremos en el Sprint 2?** Mejorar la comunicación al crear nuevas tablas en la BD para que todos tengan el script `init.sql` actualizado en sus entornos locales.

### **Retrospectiva Sprint 2**

- **Fecha:** 20 de Abril de 2026
- **Grabación:** [Insertar enlace a Google Drive]
- **Resumen:**
  1.  **¿Qué se hizo BIEN durante el Sprint?** La integración del visor PDF mejoró significativamente la experiencia del administrador. La implementación del CI/CD con GitHub Actions se logró configurar con éxito usando Secrets.
  2.  **¿Qué se hizo MAL durante el Sprint?** La curva de aprendizaje para las pruebas E2E con Cypress tomó más tiempo del estimado, lo que generó presión en los últimos días del Sprint.
  3.  **¿Qué MEJORAS implementaremos?** Para proyectos futuros, inicializar la configuración básica del framework de pruebas desde el Sprint 1, aunque las pruebas se escriban al final.

**Carpeta General de Grabaciones:** [Insertar enlace a la carpeta de Drive con todas las grabaciones]

---

## **6. Gestión en Tablero Kanban**

**[Responsable: Carlos]**

- **Link del Tablero Oficial:** [Insertar Link del Tablero]

**Evidencias del Progreso (Capturas Fase 2):**

1.  **Inicio del Proyecto/Sprint 1:**
    ![Tablero Inicio](./assets/kanban_inicio.png)
2.  **Durante el Desarrollo (Medio):**
    ![Tablero Medio](./assets/kanban_medio.png)
3.  **Final del Proyecto (Sprint 2):**
    ![Tablero Fin](./assets/kanban_fin.png)

---

## **7. Evaluación del Scrum Master al Equipo**

**Evaluador:** Marcelo Andre Juarez Alfaro (202010367)

| Integrante      | Calificación | Justificación                                                                                                                                                                                                                         |
| :-------------- | :----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Carlos** (PO) |     100      | Excelente gestión del Product Backlog, actualización detallada de los Requerimientos e Historias de Usuario. Implementó de forma sobresaliente los reportes gráficos (HU-208, HU-209) consumiendo la lógica de interacciones.         |
| **Rafael**      |     100      | Logró integrar exitosamente el manejo de archivos multipart/form-data en los registros (HU-201) y configuró eficazmente la previsualización mediante el visor de PDF incrustado para el Administrador (HU-207).                       |
| **Roberto**     |     100      | Completó de forma excepcional el módulo central de negocio: la generación de diagnósticos con múltiples medicamentos (HU-203) y la creación de las recetas en formato PDF (HU-204). Lideró la implementación de las pruebas (HU-210). |
| **Alex**        |     100      | Diseñó y desarrolló impecablemente el backend y frontend del sistema de Calificaciones Cruzadas (HU-205) y Denuncias categorizadas (HU-206), gestionando correctamente los estados de las citas.                                      |

**Comentario General:**
El equipo mantuvo un nivel de profesionalismo ejemplar durante la Fase 2. Se adoptó con éxito la mentalidad de "Vertical Slices", se cumplieron los objetivos trazados en cada Sprint Goal y se superaron los retos técnicos complejos como la integración continua y el despliegue en la nube, garantizando un producto de alta calidad y completamente funcional.
