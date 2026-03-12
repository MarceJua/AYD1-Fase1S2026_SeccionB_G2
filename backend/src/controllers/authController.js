const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTRO DE PACIENTE
const registrarPaciente = async (req, res) => {
  const { nombre, dpi, correo, password } = req.body;

  try {
    // 1. Verificar si el paciente ya existe por correo o DPI
    const userExist = await pool.query(
      "SELECT * FROM pacientes WHERE correo = $1 OR dpi = $2",
      [correo, dpi],
    );
    if (userExist.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "El correo o DPI ya están registrados." });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 3. Guardar en la base de datos
    const nuevoPaciente = await pool.query(
      "INSERT INTO pacientes (nombre, dpi, correo, password, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, correo, rol",
      [nombre, dpi, correo, passwordEncriptada, "paciente"],
    );

    res.status(201).json({
      mensaje: "Paciente registrado exitosamente",
      usuario: nuevoPaciente.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "Error en el servidor al registrar paciente" });
  }
};

// INICIO DE SESIÓN DE PACIENTE
const loginPaciente = async (req, res) => {
  const { correo, password } = req.body;

  try {
    // 1. Buscar al usuario
    const result = await pool.query(
      "SELECT * FROM pacientes WHERE correo = $1",
      [correo],
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const usuario = result.rows[0];

    // 2. Comparar la contraseña ingresada con la encriptada
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // 3. Generar el Token de Sesión
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "8h" },
    );

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
};

// REGISTRO DE MÉDICO (HU-002)
const registrarMedico = async (req, res) => {
  // 1. Extraer los campos del cuerpo de la petición (req.body)
  const { 
    nombre, apellido, dpi, fecha_nacimiento, genero, 
    direccion, telefono, numero_colegiado, especialidad, 
    direccion_clinica, correo, password 
  } = req.body;

  // 2. Validar que la foto exista (Requisito Crítico)
  if (!req.file) {
    return res.status(400).json({ error: "La fotografía es obligatoria para el registro de médicos." });
  }

  const fotoPath = req.file.path; // Ruta donde multer guardó la imagen

  try {
    // 3. Verificar si el médico ya existe (Correo, DPI o Número Colegiado)
    const medicoExist = await pool.query(
      "SELECT * FROM medicos WHERE correo = $1 OR dpi = $2 OR numero_colegiado = $3",
      [correo, dpi, numero_colegiado]
    );

    if (medicoExist.rows.length > 0) {
      return res.status(400).json({ error: "El correo, DPI o Número de Colegiado ya están registrados." });
    }

    // 4. Encriptar la contraseña (Igual que pacientes)
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 5. Insertar en la tabla 'medicos' creada previamente con el usuario 'admin'
    const nuevoMedico = await pool.query(
      `INSERT INTO medicos (
        nombre, apellido, dpi, fecha_nacimiento, genero, 
        direccion, telefono, foto, numero_colegiado, 
        especialidad, direccion_clinica, correo, contrasena, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING id, nombre, correo, estado`,
      [
        nombre, apellido, dpi, fecha_nacimiento, genero, 
        direccion, telefono, fotoPath, numero_colegiado, 
        especialidad, direccion_clinica, correo, passwordEncriptada, 'pendiente'
      ]
    );

    res.status(201).json({
      mensaje: "Registro completado. Su cuenta está pendiente de aprobación por el administrador.",
      usuario: nuevoMedico.rows[0],
    });

  } catch (error) {
    console.error("Error en registro médico:", error.message);
    res.status(500).json({ error: "Error en el servidor al registrar médico" });
  }
};

// INICIO DE SESIÓN DE MÉDICO (HU-002)
const loginMedico = async (req, res) => {
  const { correo, password } = req.body;

  try {
    // 1. Buscar al médico en la tabla que creamos
    const result = await pool.query(
      "SELECT * FROM medicos WHERE correo = $1",
      [correo]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const medico = result.rows[0];

    // 2. VALIDACIÓN CRÍTICA: ¿Está aprobado? (Requisito de la Fase 1)
    if (medico.estado !== 'aprobado') {
      return res.status(403).json({ 
        error: "Su cuenta está pendiente de aprobación por el administrador." 
      });
    }

    // 3. Comparar contraseña (Hash)
    const passwordValida = await bcrypt.compare(password, medico.contrasena);
    if (!passwordValida) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // 4. Generar Token de Sesión (Igual que pacientes, pero con rol 'medico')
    const token = jwt.sign(
      { id: medico.id, rol: 'medico' },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "8h" }
    );

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: { 
        id: medico.id, 
        nombre: medico.nombre, 
        rol: 'medico',
        foto: medico.foto 
      },
    });
  } catch (error) {
    console.error("Error en login médico:", error.message);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
};

module.exports = {
  registrarPaciente,
  loginPaciente,
  registrarMedico,
  loginMedico,
};
