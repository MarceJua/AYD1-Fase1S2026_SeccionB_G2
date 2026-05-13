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

-- 1. PACIENTES (Usamos 'aprobado' para que salgan en los conteos del Admin)
INSERT INTO pacientes (nombre, apellido, dpi, genero, direccion, telefono, fecha_nacimiento, foto, dpi_pdf, correo, password, rol, estado, correo_verificado) VALUES
  ('Paciente', 'Demo', '3000000000001', 'Masculino', 'Ciudad de Guatemala', '55550000', '1994-01-10', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'paciente@demo.com', 'bypass', 'paciente', 'aprobado', TRUE),
  ('Carlos', 'Lopez', '3012345678901', 'Masculino', 'Zona 1, Guatemala', '55550001', '1992-03-14', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'carlos.lopez@demo.com', 'bypass', 'paciente', 'aprobado', TRUE),
  ('Maria', 'Perez', '3012345678902', 'Femenino', 'Mixco, Guatemala', '55550002', '1988-11-22', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'maria.perez@demo.com', 'bypass', 'paciente', 'aprobado', TRUE),
  ('Pedro', 'Pendiente', '3012345678999', 'Masculino', 'Zona 10, Guatemala', '55550099', '1990-01-01', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'pedro.pendiente@demo.com', 'bypass', 'paciente', 'pendiente', TRUE);

-- 2. MÉDICOS (Usamos 'aprobado')
INSERT INTO medicos (nombre, apellido, dpi, fecha_nacimiento, genero, direccion, telefono, foto, numero_colegiado, especialidad, direccion_clinica, correo, contrasena, rol, estado, cv_pdf, correo_verificado) VALUES
  ('Doctor', 'Demo', '4000000000001', '1990-07-20', 'Masculino', 'Zona Demo', '55550002', '/uploads/demo-avatar.jpg', 'COL-DEMO-001', 'Medicina General', 'Clinica Demo', 'medico@demo.com', 'bypass', 'medico', 'aprobado', '/uploads/demo-doc.pdf', TRUE),
  ('Patricia', 'Castillo', '4012345679002', '1984-06-01', 'Femenino', 'Zona 4', '55551002', '/uploads/demo-avatar.jpg', 'COL-SP-002', 'Pediatria', 'Clinica Nino Sano', 'patricia@demo.com', 'bypass', 'medico', 'aprobado', '/uploads/demo-doc.pdf', TRUE),
  ('Esteban', 'Cabrera', '4012345679003', '1978-09-23', 'Masculino', 'Zona 15', '55551003', '/uploads/demo-avatar.jpg', 'COL-SP-003', 'Cardiologia', 'Unidad Cardio', 'esteban@demo.com', 'bypass', 'medico', 'aprobado', '/uploads/demo-doc.pdf', TRUE),
  ('Medico', 'Pendiente', '4012345679999', '1980-01-01', 'Femenino', 'Zona 1', '55551099', '/uploads/demo-avatar.jpg', 'COL-SP-999', 'Dermatologia', 'Clinica Piel', 'medicopendiente@demo.com', 'bypass', 'medico', 'pendiente', '/uploads/demo-doc.pdf', TRUE);

-- 3. HORARIOS (Obligatorio para que los doctores puedan recibir citas)
INSERT INTO horario_medico (medico_id, dias, hora_inicio, hora_fin) VALUES
  (1, ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes'], '08:00:00', '16:00:00'),
  (2, ARRAY['lunes', 'miercoles', 'viernes'], '09:00:00', '15:00:00'),
  (3, ARRAY['martes', 'jueves'], '08:00:00', '14:00:00');

-- 4. CITAS (Usamos 'Atendido' para que alimente las gráficas del Admin)
-- Concentramos la mayoría en medico_id = 1 (Doctor Demo) y paciente_id = 1 (Paciente Demo)
INSERT INTO citas (medico_id, paciente_id, fecha, hora, motivo, tratamiento, diagnostico, estado) VALUES
  (1, 1, '2026-01-10', '09:00:00', 'Dolor de cabeza crónico', 'Paracetamol 500mg cada 8 hrs', 'Migraña leve', 'Atendido'),
  (1, 2, '2026-02-15', '10:00:00', 'Chequeo anual de rutina', 'Vitaminas diarias', 'Paciente sano', 'Atendido'),
  (1, 3, '2026-03-20', '11:00:00', 'Fiebre y malestar general', 'Antipiréticos e hidratación', 'Infección viral aguda', 'Atendido'),
  (1, 1, '2026-04-05', '14:00:00', 'Dolor muscular en espalda', 'Ibuprofeno y reposo', 'Contractura muscular', 'Atendido'),
  (2, 1, '2026-04-10', '09:00:00', 'Consulta pediátrica general', 'Ninguno', 'Sano', 'Atendido'),
  (3, 1, '2026-05-01', '10:00:00', 'Palpitaciones en el pecho', 'Reposo y dieta baja en sodio', 'Estrés y fatiga', 'Atendido'),
  (1, 1, '2026-10-15', '09:00:00', 'Seguimiento de presión arterial', NULL, NULL, 'activa'),
  (1, 2, '2026-10-16', '10:00:00', 'Revisión de exámenes', NULL, NULL, 'activa'),
  (1, 3, '2026-01-05', '08:00:00', 'Cita cancelada por viaje', NULL, NULL, 'cancelada');

-- 5. MEDICAMENTOS
INSERT INTO medicamentos (cita_id, nombre, cantidad, tiempo, descripcion_dosis) VALUES
  (1, 'Paracetamol', '10 pastillas', '5 dias', '1 pastilla cada 8 horas después de comer'),
  (4, 'Ibuprofeno', '5 pastillas', '3 dias', '1 pastilla cada 12 horas');

-- 6. CALIFICACIONES
INSERT INTO calificaciones (cita_id, evaluador_rol, estrellas, comentario) VALUES
  (1, 'paciente', 5, 'Excelente atención del Doctor Demo. Muy profesional.'),
  (2, 'paciente', 4, 'Muy buen servicio, resolvió todas mis dudas.'),
  (3, 'paciente', 5, 'Diagnóstico rápido y tratamiento efectivo.');

-- 7. REPORTES (Para que el Admin tenga denuncias que revisar)
INSERT INTO reportes (cita_id, reportador_rol, categoria, explicacion) VALUES
  (9, 'medico', 'Inasistencia', 'El paciente no se presentó ni avisó con tiempo.');