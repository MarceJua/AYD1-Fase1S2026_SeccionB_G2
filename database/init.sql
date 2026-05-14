-- database/init.sql

-- Tabla de Pacientes (HU-001)
CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dpi VARCHAR(20) UNIQUE NOT NULL,
    dpi_pdf VARCHAR(255),
    genero VARCHAR(20),
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    foto VARCHAR(255),
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'paciente',
    estado VARCHAR(20) DEFAULT 'pendiente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    token_verificacion VARCHAR(6),
    correo_verificado BOOLEAN DEFAULT FALSE
);

-- Tabla de Médicos (HU-002)
CREATE TABLE IF NOT EXISTS medicos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dpi VARCHAR(13) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(20) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    foto TEXT NOT NULL,
    numero_colegiado VARCHAR(20) UNIQUE NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    direccion_clinica TEXT NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena TEXT NOT NULL,
    rol VARCHAR(20) DEFAULT 'medico',
    estado VARCHAR(20) DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    token_verificacion VARCHAR(6),
    cv_pdf VARCHAR(255),
    correo_verificado BOOLEAN DEFAULT FALSE

);

-- Tabla de Citas (HU-007, referenciada en reportes HU-012)
CREATE TABLE IF NOT EXISTS citas (
  id          SERIAL PRIMARY KEY,
  medico_id   INT REFERENCES medicos(id),
  paciente_id INT REFERENCES pacientes(id),
  fecha       DATE NOT NULL,
  hora        TIME NOT NULL,
  motivo      TEXT,
  tratamiento TEXT,
  diagnostico TEXT,
  estado      VARCHAR(20) DEFAULT 'activa'
);

-- Migración segura para bases de datos existentes (HU-203)
ALTER TABLE citas ADD COLUMN IF NOT EXISTS diagnostico TEXT;

-- Migración para Fase 2: Archivos PDF de registro
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS dpi_pdf VARCHAR(255);
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS cv_pdf VARCHAR(255);

-- Tabla de Medicamentos recetados por cita (HU-203)
CREATE TABLE IF NOT EXISTS medicamentos (
  id               SERIAL PRIMARY KEY,
  cita_id          INT REFERENCES citas(id) ON DELETE CASCADE,
  nombre           VARCHAR(200) NOT NULL,
  cantidad         VARCHAR(100) NOT NULL,
  tiempo           VARCHAR(100) NOT NULL,
  descripcion_dosis TEXT NOT NULL
);

-- Tabla de Horario del Médico (HU-009)
-- Un médico solo puede tener UN horario (medico_id UNIQUE)
-- dias: arreglo de días, ej: {'lunes','miercoles','viernes'}
-- hora_inicio / hora_fin: aplican igual para todos los días seleccionados
CREATE TABLE IF NOT EXISTS horario_medico (
  id          SERIAL PRIMARY KEY,
  medico_id   INT UNIQUE REFERENCES medicos(id),
  dias        TEXT[],
  hora_inicio TIME NOT NULL,
  hora_fin    TIME NOT NULL
);


-- Tabla de Calificaciones (HU-205)
CREATE TABLE IF NOT EXISTS calificaciones (
    id SERIAL PRIMARY KEY,
    cita_id INT REFERENCES citas(id) ON DELETE CASCADE,
    evaluador_rol VARCHAR(20) CHECK (evaluador_rol IN ('paciente', 'medico')) NOT NULL,
    estrellas INT CHECK (estrellas >= 0 AND estrellas <= 5) NOT NULL,
    comentario TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Evitamos que un mismo rol califique la misma cita más de una vez
    UNIQUE(cita_id, evaluador_rol) 
);

-- Tabla de Reportes / Denuncias (HU-206)
CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    cita_id INT REFERENCES citas(id) ON DELETE CASCADE,
    reportador_rol VARCHAR(20) CHECK (reportador_rol IN ('paciente', 'medico')) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    explicacion TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Evitamos que un mismo rol reporte la misma cita más de una vez
    UNIQUE(cita_id, reportador_rol)
);

-- ============================================================================
-- SEED DE DEMO SALUDPLUS
-- ============================================================================

-- 1. PACIENTES ACTIVOS (Estado 'aprobado' para que aparezcan en listas del Admin)
INSERT INTO pacientes (nombre, apellido, dpi, genero, direccion, telefono, fecha_nacimiento, foto, dpi_pdf, correo, password, rol, estado, correo_verificado) VALUES
  ('Paciente', 'Demo', '3000000000001', 'Masculino', 'Ciudad de Guatemala', '55550000', '1994-01-10', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'paciente@demo.com', 'bypass', 'paciente', 'aprobado', TRUE),
  ('Carlos', 'Lopez', '3012345678901', 'Masculino', 'Zona 1, Guatemala', '55550001', '1992-03-14', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'carlos.lopez@demo.com', 'bypass', 'paciente', 'aprobado', TRUE),
  ('Maria', 'Perez', '3012345678902', 'Femenino', 'Mixco, Guatemala', '55550002', '1988-11-22', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'maria.perez@demo.com', 'bypass', 'paciente', 'aprobado', TRUE);

-- 2. PACIENTES PENDIENTES DE APROBACIÓN (Para que el Admin los vea y acepte)
INSERT INTO pacientes (nombre, apellido, dpi, genero, direccion, telefono, fecha_nacimiento, foto, dpi_pdf, correo, password, rol, estado, correo_verificado) VALUES
  ('Juan', 'Pendiente', '3012345678998', 'Masculino', 'Zona 10, Guatemala', '55550098', '1990-05-20', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'juan.pendiente@demo.com', 'bypass', 'paciente', 'pendiente', TRUE),
  ('Elena', 'Solicitud', '3012345678997', 'Femenino', 'Santa Catarina, Guatemala', '55550097', '1993-08-15', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'elena.solicitud@demo.com', 'bypass', 'paciente', 'pendiente', TRUE);

-- 3. MÉDICOS ACTIVOS (Estado 'aprobado')
INSERT INTO medicos (nombre, apellido, dpi, fecha_nacimiento, genero, direccion, telefono, foto, numero_colegiado, especialidad, direccion_clinica, correo, contrasena, rol, estado, cv_pdf, correo_verificado) VALUES
  ('Doctor', 'Demo', '4000000000001', '1990-07-20', 'Masculino', 'Zona Demo', '55550002', '/uploads/demo-avatar.jpg', 'COL-DEMO-001', 'Medicina General', 'Clinica Demo', 'medico@demo.com', 'bypass', 'medico', 'aprobado', '/uploads/demo-doc.pdf', TRUE),
  ('Patricia', 'Castillo', '4012345679002', '1984-06-01', 'Femenino', 'Zona 4', '55551002', '/uploads/demo-avatar.jpg', 'COL-SP-002', 'Pediatria', 'Clinica Niño Sano', 'patricia@demo.com', 'bypass', 'medico', 'aprobado', '/uploads/demo-doc.pdf', TRUE),
  ('Esteban', 'Cabrera', '4012345679003', '1978-09-23', 'Masculino', 'Zona 15', '55551003', '/uploads/demo-avatar.jpg', 'COL-SP-003', 'Cardiologia', 'Unidad Cardio', 'esteban@demo.com', 'bypass', 'medico', 'aprobado', '/uploads/demo-doc.pdf', TRUE);

-- 4. MÉDICOS PENDIENTES DE APROBACIÓN
INSERT INTO medicos (nombre, apellido, dpi, fecha_nacimiento, genero, direccion, telefono, foto, numero_colegiado, especialidad, direccion_clinica, correo, contrasena, rol, estado, cv_pdf, correo_verificado) VALUES
  ('Luis', 'Revisión', '4012345679998', '1982-11-12', 'Masculino', 'Zona 2', '55551098', '/uploads/demo-avatar.jpg', 'COL-SP-998', 'Dermatologia', 'Clinica Piel', 'luis.revision@demo.com', 'bypass', 'medico', 'pendiente', '/uploads/demo-doc.pdf', TRUE),
  ('Ana', 'Espera', '4012345679997', '1985-03-30', 'Femenino', 'Mixco', '55551097', '/uploads/demo-avatar.jpg', 'COL-SP-997', 'Odontologia', 'Dental Care', 'ana.espera@demo.com', 'bypass', 'medico', 'pendiente', '/uploads/demo-doc.pdf', TRUE);

-- 5. HORARIOS (Obligatorio para que los doctores aprobados reciban citas)
INSERT INTO horario_medico (medico_id, dias, hora_inicio, hora_fin) VALUES
  (1, ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], '08:00:00', '16:00:00'),
  (2, ARRAY['lunes', 'miercoles', 'viernes'], '09:00:00', '15:00:00'),
  (3, ARRAY['martes', 'jueves'], '08:00:00', '14:00:00');

-- 6. CITAS PARA REPORTES ANALÍTICOS (Usamos 'Atendido' para alimentar gráficas)
INSERT INTO citas (medico_id, paciente_id, fecha, hora, motivo, tratamiento, diagnostico, estado) VALUES
  (1, 1, '2026-01-10', '09:00:00', 'Chequeo rutinario', 'Vitaminas', 'Paciente saludable', 'Atendido'),
  (1, 2, '2026-02-15', '10:00:00', 'Dolor de cabeza', 'Paracetamol', 'Cefalea tensional', 'Atendido'),
  (1, 3, '2026-03-20', '11:00:00', 'Fiebre persistente', 'Antipiréticos', 'Infección viral', 'Atendido'),
  (2, 1, '2026-04-10', '09:00:00', 'Consulta pediátrica', 'Seguimiento', 'Desarrollo normal', 'Atendido'),
  (3, 1, '2026-05-01', '10:00:00', 'Palpitaciones', 'Enalapril', 'Hipertensión leve', 'Atendido'),
  (1, 1, '2026-05-15', '09:00:00', 'Revisión de presión', 'Continuar dieta', 'Controlado', 'Atendido'),
  (1, 2, '2026-04-20', '15:00:00', 'Seguimiento', 'Ninguno', 'Estable', 'Atendido');

-- 7. CALIFICACIONES (Para la pestaña "Denuncias y calificación")
INSERT INTO calificaciones (cita_id, evaluador_rol, estrellas, comentario) VALUES
  (1, 'paciente', 5, 'Excelente trato por parte del Doctor Demo.'),
  (2, 'paciente', 4, 'Atención rápida y efectiva.'),
  (3, 'paciente', 5, 'El diagnóstico fue muy preciso.'),
  (4, 'paciente', 5, 'Muy paciente con mi hijo, recomendada.');

-- 8. DENUNCIAS / REPORTES (Para la pestaña "Denuncias y calificación")
INSERT INTO reportes (cita_id, reportador_rol, categoria, explicacion) VALUES
  (5, 'paciente', 'Impuntualidad', 'El médico llegó 30 minutos tarde a la cita.'),
  (1, 'medico', 'Inasistencia', 'El paciente no confirmó la cita previa.');

-- Ajustar los contadores de ID para evitar errores en futuras inserciones manuales
SELECT setval(pg_get_serial_sequence('pacientes', 'id'), (SELECT MAX(id) FROM pacientes));
SELECT setval(pg_get_serial_sequence('medicos', 'id'), (SELECT MAX(id) FROM medicos));
SELECT setval(pg_get_serial_sequence('citas', 'id'), (SELECT MAX(id) FROM citas));