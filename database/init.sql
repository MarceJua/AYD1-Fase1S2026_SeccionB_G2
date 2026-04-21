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