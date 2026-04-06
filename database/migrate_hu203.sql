-- Migración HU-203: Tratamiento Estructurado Médico
-- Ejecutar este script si la base de datos ya existe y no incluye estos cambios

-- 1. Agregar columna diagnostico a la tabla citas
ALTER TABLE citas ADD COLUMN IF NOT EXISTS diagnostico TEXT;

-- 2. Crear tabla de medicamentos por cita
CREATE TABLE IF NOT EXISTS medicamentos (
  id               SERIAL PRIMARY KEY,
  cita_id          INT REFERENCES citas(id) ON DELETE CASCADE,
  nombre           VARCHAR(200) NOT NULL,
  cantidad         VARCHAR(100) NOT NULL,
  tiempo           VARCHAR(100) NOT NULL,
  descripcion_dosis TEXT NOT NULL
);
