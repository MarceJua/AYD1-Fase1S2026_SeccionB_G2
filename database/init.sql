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
-- No existe una tabla admins en este esquema; el acceso demo del administrador
-- se resuelve en backend/authController.js con las credenciales admin@demo.com / demo123.

INSERT INTO pacientes (
  nombre,
  apellido,
  dpi,
  genero,
  direccion,
  telefono,
  fecha_nacimiento,
  foto,
  dpi_pdf,
  correo,
  password,
  rol,
  estado,
  token_verificacion,
  correo_verificado
) VALUES
  ('Paciente', 'Demo', '3000000000001', 'Masculino', 'Ciudad de Guatemala', '55550000', '1994-01-10', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'paciente@demo.com', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Carlos', 'Lopez', '3012345678901', 'Masculino', 'Zona 1, Guatemala', '55550001', '1992-03-14', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'carlos.lopez@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Maria Fernanda', 'Perez', '3012345678902', 'Femenino', 'Mixco, Guatemala', '55550002', '1988-11-22', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'maria.perez@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Jose Luis', 'Hernandez', '3012345678903', 'Masculino', 'Zona 7, Guatemala', '55550003', '1990-07-09', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'jose.hernandez@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Ana Lucia', 'Gomez', '3012345678904', 'Femenino', 'Villa Nueva, Guatemala', '55550004', '1995-05-18', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'ana.gomez@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Luis Alberto', 'Morales', '3012345678905', 'Masculino', 'Antigua Guatemala, Sacatepequez', '55550005', '1983-01-27', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'luis.morales@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Gabriela', 'Ruiz', '3012345678906', 'Femenino', 'Quetzaltenango, Guatemala', '55550006', '1998-09-03', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'gabriela.ruiz@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Jorge Andres', 'Castro', '3012345678907', 'Masculino', 'Coban, Alta Verapaz', '55550007', '1991-12-11', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'jorge.castro@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Sofia', 'Martinez', '3012345678908', 'Femenino', 'Escuintla, Guatemala', '55550008', '1997-04-25', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'sofia.martinez@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Ricardo', 'Salazar', '3012345678909', 'Masculino', 'Chimaltenango, Guatemala', '55550009', '1986-08-30', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'ricardo.salazar@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Valeria', 'Fuentes', '3012345678910', 'Femenino', 'Amatitlan, Guatemala', '55550010', '1993-02-06', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'valeria.fuentes@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Manuel', 'Ortega', '3012345678911', 'Masculino', 'Huehuetenango, Guatemala', '55550011', '1989-10-19', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'manuel.ortega@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE),
  ('Daniela', 'Rojas', '3012345678912', 'Femenino', 'Santa Catarina Pinula, Guatemala', '55550012', '1999-06-21', '/uploads/demo-avatar.jpg', '/uploads/demo-doc.pdf', 'daniela.rojas@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'paciente', 'aceptado', NULL, TRUE)
ON CONFLICT (correo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  dpi = EXCLUDED.dpi,
  genero = EXCLUDED.genero,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  fecha_nacimiento = EXCLUDED.fecha_nacimiento,
  foto = EXCLUDED.foto,
  dpi_pdf = EXCLUDED.dpi_pdf,
  password = EXCLUDED.password,
  rol = EXCLUDED.rol,
  estado = EXCLUDED.estado,
  token_verificacion = EXCLUDED.token_verificacion,
  correo_verificado = EXCLUDED.correo_verificado;

INSERT INTO medicos (
  nombre,
  apellido,
  dpi,
  fecha_nacimiento,
  genero,
  direccion,
  telefono,
  foto,
  numero_colegiado,
  especialidad,
  direccion_clinica,
  correo,
  contrasena,
  rol,
  estado,
  token_verificacion,
  cv_pdf,
  correo_verificado
) VALUES
  ('Medico', 'Demo', '4000000000001', '1990-07-20', 'Masculino', 'Zona Demo, Guatemala', '55550002', '/uploads/demo-avatar.jpg', 'COL-DEMO-001', 'Medicina General', 'Clinica Demo SaludPlus, Guatemala', 'medico@demo.com', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Roberto', 'Alvarez', '4012345679001', '1980-02-14', 'Masculino', 'Zona 10, Guatemala', '55551001', '/uploads/demo-avatar.jpg', 'COL-SP-001', 'Medicina General', 'Clinica Central SaludPlus, Zona 10, Guatemala', 'roberto.alvarez@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Patricia', 'Castillo', '4012345679002', '1984-06-01', 'Femenino', 'Zona 4, Guatemala', '55551002', '/uploads/demo-avatar.jpg', 'COL-SP-002', 'Pediatria', 'Clinica Nino Sano, Zona 4, Guatemala', 'patricia.castillo@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Esteban', 'Cabrera', '4012345679003', '1978-09-23', 'Masculino', 'Zona 15, Guatemala', '55551003', '/uploads/demo-avatar.jpg', 'COL-SP-003', 'Cardiologia', 'Unidad Cardiovascular, Zona 15, Guatemala', 'esteban.cabrera@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Carolina', 'Navarro', '4012345679004', '1986-12-17', 'Femenino', 'Zona 9, Guatemala', '55551004', '/uploads/demo-avatar.jpg', 'COL-SP-004', 'Dermatologia', 'Centro Dermatologico del Sur, Zona 9, Guatemala', 'carolina.navarro@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Fernando', 'Mendez', '4012345679005', '1979-04-08', 'Masculino', 'Zona 1, Guatemala', '55551005', '/uploads/demo-avatar.jpg', 'COL-SP-005', 'Odontologia', 'Clinica Dental Sonrisa, Zona 1, Guatemala', 'fernando.mendez@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Isabel', 'Vega', '4012345679006', '1985-11-29', 'Femenino', 'Zona 7, Guatemala', '55551006', '/uploads/demo-avatar.jpg', 'COL-SP-006', 'Ginecologia', 'Salud Mujer Integral, Zona 7, Guatemala', 'isabel.vega@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Diego', 'Ramos', '4012345679007', '1982-01-16', 'Masculino', 'Zona 12, Guatemala', '55551007', '/uploads/demo-avatar.jpg', 'COL-SP-007', 'Traumatologia', 'Clinica Ortopedica Metropolitana, Zona 12, Guatemala', 'diego.ramos@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Elena', 'Herrera', '4012345679008', '1987-07-05', 'Femenino', 'Zona 3, Guatemala', '55551008', '/uploads/demo-avatar.jpg', 'COL-SP-008', 'Neurologia', 'Centro Neurologico Oriente, Zona 3, Guatemala', 'elena.herrera@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Miguel', 'Pineda', '4012345679009', '1981-03-31', 'Masculino', 'Zona 5, Guatemala', '55551009', '/uploads/demo-avatar.jpg', 'COL-SP-009', 'Psiquiatria', 'Centro de Salud Mental, Zona 5, Guatemala', 'miguel.pineda@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Lucia', 'Acosta', '4012345679010', '1989-10-12', 'Femenino', 'Zona 14, Guatemala', '55551010', '/uploads/demo-avatar.jpg', 'COL-SP-010', 'Oftalmologia', 'Vision Clara, Zona 14, Guatemala', 'lucia.acosta@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Pablo', 'Quintana', '4012345679011', '1983-08-20', 'Masculino', 'Zona 2, Guatemala', '55551011', '/uploads/demo-avatar.jpg', 'COL-SP-011', 'Otorrinolaringologia', 'Centro ORL del Pacifico, Zona 2, Guatemala', 'pablo.quintana@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Jimena', 'Molina', '4012345679012', '1990-05-26', 'Femenino', 'Zona 8, Guatemala', '55551012', '/uploads/demo-avatar.jpg', 'COL-SP-012', 'Urologia', 'Clinica Urologica del Norte, Zona 8, Guatemala', 'jimena.molina@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Sergio', 'Aguilar', '4012345679013', '1977-12-09', 'Masculino', 'Zona 11, Guatemala', '55551013', '/uploads/demo-avatar.jpg', 'COL-SP-013', 'Endocrinologia', 'Clinica del Metabolismo, Zona 11, Guatemala', 'sergio.aguilar@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Adriana', 'Campos', '4012345679014', '1988-04-15', 'Femenino', 'Zona 13, Guatemala', '55551014', '/uploads/demo-avatar.jpg', 'COL-SP-014', 'Gastroenterologia', 'Centro Digestivo Integral, Zona 13, Guatemala', 'adriana.campos@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE),
  ('Teresa', 'Lopez', '4012345679015', '1984-02-28', 'Femenino', 'Zona 6, Guatemala', '55551015', '/uploads/demo-avatar.jpg', 'COL-SP-015', 'Medicina Interna', 'Hospital Privado del Valle, Zona 6, Guatemala', 'teresa.lopez@saludplus.demo', '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 'medico', 'aceptado', NULL, '/uploads/demo-doc.pdf', TRUE)
ON CONFLICT (correo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  dpi = EXCLUDED.dpi,
  fecha_nacimiento = EXCLUDED.fecha_nacimiento,
  genero = EXCLUDED.genero,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  foto = EXCLUDED.foto,
  numero_colegiado = EXCLUDED.numero_colegiado,
  especialidad = EXCLUDED.especialidad,
  direccion_clinica = EXCLUDED.direccion_clinica,
  contrasena = EXCLUDED.contrasena,
  rol = EXCLUDED.rol,
  estado = EXCLUDED.estado,
  token_verificacion = EXCLUDED.token_verificacion,
  cv_pdf = EXCLUDED.cv_pdf,
  correo_verificado = EXCLUDED.correo_verificado;

INSERT INTO horario_medico (
  medico_id,
  dias,
  hora_inicio,
  hora_fin
) VALUES
  (1, ARRAY['lunes', 'miercoles', 'viernes'], '08:00:00', '14:00:00'),
  (2, ARRAY['martes', 'jueves', 'sabado'], '09:00:00', '15:00:00'),
  (3, ARRAY['lunes', 'martes', 'jueves'], '07:00:00', '13:00:00'),
  (4, ARRAY['lunes', 'miercoles'], '10:00:00', '17:00:00'),
  (5, ARRAY['martes', 'miercoles', 'viernes'], '08:30:00', '16:30:00'),
  (6, ARRAY['lunes', 'jueves', 'sabado'], '09:00:00', '14:00:00'),
  (7, ARRAY['lunes', 'martes', 'viernes'], '08:00:00', '15:00:00'),
  (8, ARRAY['miercoles', 'jueves', 'viernes'], '07:30:00', '13:30:00'),
  (9, ARRAY['martes', 'jueves'], '13:00:00', '19:00:00'),
  (10, ARRAY['lunes', 'miercoles', 'viernes'], '09:00:00', '15:00:00'),
  (11, ARRAY['martes', 'jueves', 'sabado'], '08:00:00', '12:00:00'),
  (12, ARRAY['lunes', 'miercoles', 'viernes'], '14:00:00', '18:00:00'),
  (13, ARRAY['lunes', 'martes', 'jueves'], '08:00:00', '14:00:00'),
  (14, ARRAY['martes', 'miercoles', 'viernes'], '10:00:00', '16:00:00'),
  (15, ARRAY['lunes', 'jueves'], '07:00:00', '12:00:00')
ON CONFLICT (medico_id) DO UPDATE SET
  dias = EXCLUDED.dias,
  hora_inicio = EXCLUDED.hora_inicio,
  hora_fin = EXCLUDED.hora_fin;

INSERT INTO citas (
  id,
  medico_id,
  paciente_id,
  fecha,
  hora,
  motivo,
  tratamiento,
  diagnostico,
  estado
) VALUES
  (1, 1, 1, '2026-01-12', '08:30:00', 'Chequeo general por fiebre leve', 'Hidratacion, paracetamol 500 mg cada 8 horas por 3 dias y reposo', 'Cuadro viral agudo sin signos de alarma', 'completada'),
  (2, 2, 2, '2026-01-18', '10:00:00', 'Tos persistente y dolor de garganta', 'Amoxicilina 500 mg cada 8 horas por 7 dias y acetaminofen segun dolor', 'Faringitis bacteriana', 'completada'),
  (3, 3, 3, '2026-01-25', '09:15:00', 'Control de presion arterial', 'Enalapril 10 mg cada 12 horas y dieta baja en sodio', 'Hipertension arterial esencial', 'completada'),
  (4, 4, 4, '2026-02-03', '11:20:00', 'Sarpullido con picazon en brazos', 'Cetirizina por la noche y crema de hidrocortisona 1 por ciento dos veces al dia', 'Dermatitis alergica', 'completada'),
  (5, 5, 5, '2026-02-10', '14:00:00', 'Dolor en muela superior derecha', 'Ibuprofeno cada 8 horas, amoxicilina por 7 dias y control odontologico', 'Caries dental con inflamacion', 'completada'),
  (6, 6, 6, '2026-02-16', '08:45:00', 'Revision ginecologica y flujo anormal', 'Clotrimazol vaginal y seguimiento en 10 dias', 'Candidiasis vulvovaginal', 'completada'),
  (7, 7, 7, '2026-02-22', '13:10:00', 'Torsion de tobillo en actividad deportiva', 'Naproxeno cada 12 horas, reposo, hielo y vendaje elastico', 'Esguince de tobillo grado I', 'completada'),
  (8, 8, 8, '2026-03-02', '15:30:00', 'Cefaleas intensas recurrentes', 'Sumatriptan segun episodio y control de desencadenantes', 'Migrana sin aura', 'completada'),
  (9, 9, 9, '2026-03-07', '12:00:00', 'Ansiedad e insomnio', 'Sertralina 50 mg al dia, higiene del sueno y seguimiento psicoterapeutico', 'Trastorno de ansiedad generalizada', 'completada'),
  (10, 10, 10, '2026-03-12', '09:40:00', 'Ojo rojo y lagrimeo', 'Lagrimas artificiales y colirio antibiotico por 5 dias', 'Conjuntivitis leve', 'completada'),
  (11, 11, 11, '2026-03-18', '16:20:00', 'Dolor de oido y congestion', 'Antiinflamatorio oral y gotas oticas segun evaluacion', 'Otitis media aguda', 'completada'),
  (12, 12, 12, '2026-03-24', '10:10:00', 'Ardor al orinar', 'Nitrofurantoina por 5 dias e hidratacion', 'Infeccion urinaria no complicada', 'completada'),
  (13, 13, 1, '2026-04-01', '08:50:00', 'Control de glucosa en ayunas', 'Metformina 850 mg dos veces al dia y plan de alimentacion', 'Diabetes mellitus tipo 2 control suboptimo', 'completada'),
  (14, 14, 2, '2026-04-08', '11:30:00', 'Dolor epigastrico posprandial', 'Omeprazol antes del desayuno y dieta blanda', 'Gastritis aguda', 'completada'),
  (15, 15, 3, '2026-04-15', '09:00:00', 'Fatiga persistente y palidez', 'Suplemento de hierro y control de laboratorio', 'Anemia ferropenica probable', 'completada'),
  (16, 16, 13, '2026-05-20', '08:30:00', 'Control general y revision de laboratorio', NULL, NULL, 'activa'),
  (17, 16, 13, '2026-05-22', '10:15:00', 'Seguimiento de sintomas respiratorios leves', NULL, NULL, 'activa'),
  (18, 3, 6, '2026-05-28', '09:00:00', 'Seguimiento cardiologico', NULL, NULL, 'activa'),
  (19, 4, 7, '2026-06-03', '11:00:00', 'Revision de lunar y control dermatologico', NULL, NULL, 'activa'),
  (20, 5, 8, '2026-06-05', '14:45:00', 'Limpieza dental preventiva', NULL, NULL, 'activa'),
  (21, 6, 9, '2026-06-08', '09:30:00', 'Control ginecologico de rutina', NULL, NULL, 'activa'),
  (22, 7, 10, '2026-02-28', '13:00:00', 'Paciente solicito reprogramacion por emergencia familiar', NULL, NULL, 'cancelada'),
  (23, 8, 11, '2026-04-20', '15:00:00', 'Cita cancelada por inasistencia del paciente', NULL, NULL, 'cancelada'),
  (24, 9, 12, '2026-07-01', '12:30:00', 'Sesion cancelada por atraso del medico', NULL, NULL, 'cancelada'),
  (25, 10, 1, '2026-08-22', '10:00:00', 'No se pudo confirmar asistencia', NULL, NULL, 'cancelada')
ON CONFLICT (id) DO UPDATE SET
  medico_id = EXCLUDED.medico_id,
  paciente_id = EXCLUDED.paciente_id,
  fecha = EXCLUDED.fecha,
  hora = EXCLUDED.hora,
  motivo = EXCLUDED.motivo,
  tratamiento = EXCLUDED.tratamiento,
  diagnostico = EXCLUDED.diagnostico,
  estado = EXCLUDED.estado;

INSERT INTO medicamentos (
  id,
  cita_id,
  nombre,
  cantidad,
  tiempo,
  descripcion_dosis
) VALUES
  (1, 1, 'Paracetamol 500 mg', '10 tabletas', 'cada 8 horas por 3 dias', 'Tomar despues de alimentos si persiste la fiebre.'),
  (2, 1, 'Suero oral', '2 sobres', 'segun tolerancia por 2 dias', 'Disolver en agua y tomar durante el dia.'),
  (3, 2, 'Amoxicilina 500 mg', '21 capsulas', 'cada 8 horas por 7 dias', 'Completar el tratamiento aunque disminuyan los sintomas.'),
  (4, 2, 'Acetaminofen 500 mg', '12 tabletas', 'cada 6 horas si hay dolor', 'Usar solo en caso de fiebre o malestar.'),
  (5, 3, 'Enalapril 10 mg', '30 tabletas', 'cada 12 horas', 'Controlar la presion arterial diariamente.'),
  (6, 3, 'Hidroclorotiazida 25 mg', '15 tabletas', 'una vez al dia', 'Tomar en la manana para evitar molestias nocturnas.'),
  (7, 4, 'Cetirizina 10 mg', '10 tabletas', 'una vez al dia en la noche', 'Reduce la picazon y la reaccion alergica.'),
  (8, 4, 'Crema de hidrocortisona 1 por ciento', '1 tubo', 'dos veces al dia por 5 dias', 'Aplicar una capa delgada sobre la zona afectada.'),
  (9, 5, 'Ibuprofeno 400 mg', '12 tabletas', 'cada 8 horas por 3 dias', 'Tomar con comida para disminuir irritacion gastrica.'),
  (10, 5, 'Amoxicilina 500 mg', '21 capsulas', 'cada 8 horas por 7 dias', 'Mantener higiene oral y asistir al control.'),
  (11, 6, 'Clotrimazol crema vaginal', '1 aplicador', 'por 7 noches', 'Aplicar antes de dormir segun indicacion.'),
  (12, 6, 'Fluconazol 150 mg', '1 capsula', 'dosis unica', 'Tomar con un vaso de agua luego de comer.'),
  (13, 7, 'Naproxeno 500 mg', '10 tabletas', 'cada 12 horas por 5 dias', 'Ayuda a controlar dolor e inflamacion.'),
  (14, 7, 'Diclofenaco gel', '1 tubo', 'tres veces al dia', 'Aplicar en el tobillo sin masajear con fuerza.'),
  (15, 8, 'Sumatriptan 50 mg', '6 tabletas', 'segun episodio de migrana', 'Usar al inicio del dolor de cabeza.'),
  (16, 8, 'Naproxeno 250 mg', '10 tabletas', 'cada 12 horas por 3 dias', 'Tomar si no hay alivio con medidas de reposo.'),
  (17, 9, 'Sertralina 50 mg', '30 tabletas', 'una vez al dia', 'Tomar a la misma hora todos los dias.'),
  (18, 9, 'Melatonina 3 mg', '15 tabletas', 'antes de dormir', 'Usar como apoyo para el descanso nocturno.'),
  (19, 10, 'Lagrimas artificiales', '1 frasco', 'cada 6 horas', 'Aplicar en ambos ojos segun necesidad.'),
  (20, 10, 'Tobramicina colirio', '1 frasco', 'cada 8 horas por 5 dias', 'No tocar el ojo con la punta del gotero.'),
  (21, 11, 'Amoxicilina 875 mg', '14 tabletas', 'cada 12 horas por 7 dias', 'Tomar con suficiente agua.'),
  (22, 11, 'Ibuprofeno 400 mg', '12 tabletas', 'cada 8 horas por 3 dias', 'Usar para controlar dolor y fiebre.'),
  (23, 12, 'Nitrofurantoina 100 mg', '10 capsulas', 'cada 12 horas por 5 dias', 'Mantener buena hidratacion durante el tratamiento.'),
  (24, 12, 'Fenazopiridina 200 mg', '6 tabletas', 'cada 8 horas por 2 dias', 'Usar solo para alivio sintomatico.'),
  (25, 13, 'Metformina 850 mg', '60 tabletas', 'cada 12 horas', 'Tomar con alimentos para mejorar tolerancia.'),
  (26, 13, 'Acarbosa 50 mg', '30 tabletas', 'antes de las comidas principales', 'Controla picos de glucosa posprandial.'),
  (27, 14, 'Omeprazol 20 mg', '14 capsulas', 'antes del desayuno', 'Tomar durante 14 dias seguidos.'),
  (28, 14, 'Sucralfato 1 g', '28 sobres', 'cada 8 horas', 'Disolver en agua y tomar fuera de las comidas.'),
  (29, 15, 'Sulfato ferroso 325 mg', '30 tabletas', 'una vez al dia', 'Tomar por la manana con jugo de naranja.'),
  (30, 15, 'Acido folico 5 mg', '30 tabletas', 'una vez al dia', 'Complementar la correccion de la anemia.')
ON CONFLICT (id) DO UPDATE SET
  cita_id = EXCLUDED.cita_id,
  nombre = EXCLUDED.nombre,
  cantidad = EXCLUDED.cantidad,
  tiempo = EXCLUDED.tiempo,
  descripcion_dosis = EXCLUDED.descripcion_dosis;

INSERT INTO calificaciones (
  cita_id,
  evaluador_rol,
  estrellas,
  comentario
) VALUES
  (1, 'paciente', 5, 'Excelente atencion y explicacion clara.'),
  (2, 'paciente', 4, 'Consulta rapida y efectiva.'),
  (3, 'paciente', 5, 'Muy buen seguimiento y recomendaciones.'),
  (4, 'paciente', 4, 'Buena atencion y trato amable.'),
  (5, 'paciente', 5, 'Resolvio el dolor en una sola cita.'),
  (6, 'paciente', 4, 'Atencion cuidadosa y profesional.'),
  (7, 'paciente', 5, 'Me explico la rehabilitacion paso a paso.'),
  (8, 'paciente', 4, 'La consulta fue puntual y util.'),
  (9, 'paciente', 5, 'Me ayudo mucho con la ansiedad.'),
  (10, 'paciente', 4, 'Revision detallada y clara.'),
  (11, 'paciente', 5, 'Excelente control y orientacion.'),
  (12, 'paciente', 4, 'Solucion rapida y buena comunicacion.')
ON CONFLICT (cita_id, evaluador_rol) DO UPDATE SET
  estrellas = EXCLUDED.estrellas,
  comentario = EXCLUDED.comentario;

INSERT INTO reportes (
  cita_id,
  reportador_rol,
  categoria,
  explicacion
) VALUES
  (5, 'paciente', 'Impuntualidad', 'El medico llego 40 minutos tarde y no aviso con anticipacion.'),
  (11, 'medico', 'Inasistencia', 'El paciente no se presento a la cita ni confirmo la reprogramacion.'),
  (23, 'paciente', 'Atencion deficiente', 'La cancelacion se informo muy tarde y afecto la planificacion del tratamiento.')
ON CONFLICT (cita_id, reportador_rol) DO UPDATE SET
  categoria = EXCLUDED.categoria,
  explicacion = EXCLUDED.explicacion;

-- =================================================================
-- USUARIOS MAESTROS PARA LOS BOTONES DE DEMO (QUICK LOGIN)
-- =================================================================

INSERT INTO pacientes (nombre, apellido, dpi, genero, direccion, telefono, fecha_nacimiento, foto, correo, password, rol, estado, correo_verificado)
VALUES (
    'Paciente', 'Demo', '0000000000001', 'Masculino', 'Ciudad Demo', '11111111', '1995-05-15', 
    '/uploads/demo-avatar.jpg', 'paciente@demo.com', 
    '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 
    'paciente', 'aceptado', true
) ON CONFLICT (correo) DO NOTHING;

INSERT INTO medicos (nombre, apellido, dpi, fecha_nacimiento, genero, direccion, telefono, foto, numero_colegiado, especialidad, direccion_clinica, correo, contrasena, rol, estado, correo_verificado)
VALUES (
    'Doctor', 'Demo', '0000000000002', '1980-10-10', 'Femenino', 'Ciudad Demo', '22222222', 
    '/uploads/demo-doc.jpg', 'DEMO-999', 'Medicina General', 'Clínica Principal', 'medico@demo.com', 
    '$2a$10$wO9W7x9y.fKx2XQ2E6cMyeR.A1y7Z/M6D/5M4T.fN8r4ZgZ4Z4Z4Z', 
    'medico', 'aceptado', true
) ON CONFLICT (correo) DO NOTHING;

-- Aseguramos que el Doctor Demo tenga horario para que el dashboard no falle
INSERT INTO horario_medico (medico_id, dias, hora_inicio, hora_fin)
VALUES (
    (SELECT id FROM medicos WHERE correo = 'medico@demo.com'),
    ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    '08:00:00', '16:00:00'
) ON CONFLICT (medico_id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('citas', 'id'), (SELECT COALESCE(MAX(id), 1) FROM citas));
SELECT setval(pg_get_serial_sequence('medicamentos', 'id'), (SELECT COALESCE(MAX(id), 1) FROM medicamentos));
SELECT setval(pg_get_serial_sequence('pacientes', 'id'), (SELECT COALESCE(MAX(id), 1) FROM pacientes));
SELECT setval(pg_get_serial_sequence('medicos', 'id'), (SELECT COALESCE(MAX(id), 1) FROM medicos));
SELECT setval(pg_get_serial_sequence('horario_medico', 'id'), (SELECT COALESCE(MAX(id), 1) FROM horario_medico));
SELECT setval(pg_get_serial_sequence('calificaciones', 'id'), (SELECT COALESCE(MAX(id), 1) FROM calificaciones));
SELECT setval(pg_get_serial_sequence('reportes', 'id'), (SELECT COALESCE(MAX(id), 1) FROM reportes));

-- Convertir un par de cuentas a estado pendiente para alimentar el Dashboard del Admin
UPDATE pacientes SET estado = 'pendiente' WHERE id IN (11, 12);
UPDATE medicos SET estado = 'pendiente' WHERE id IN (14, 15);