const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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
    nombre,
    apellido,
    dpi,
    fecha_nacimiento,
    genero,
    direccion,
    telefono,
    numero_colegiado,
    especialidad,
    direccion_clinica,
    correo,
    password,
  } = req.body;

  // 2. Validar que la foto exista (Requisito Crítico)
  if (!req.file) {
    return res.status(400).json({
      error: "La fotografía es obligatoria para el registro de médicos.",
    });
  }

  const fotoPath = req.file.path; // Ruta donde multer guardó la imagen

  try {
    // 3. Verificar si el médico ya existe (Correo, DPI o Número Colegiado)
    const medicoExist = await pool.query(
      "SELECT * FROM medicos WHERE correo = $1 OR dpi = $2 OR numero_colegiado = $3",
      [correo, dpi, numero_colegiado],
    );

    if (medicoExist.rows.length > 0) {
      return res.status(400).json({
        error: "El correo, DPI o Número de Colegiado ya están registrados.",
      });
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
        nombre,
        apellido,
        dpi,
        fecha_nacimiento,
        genero,
        direccion,
        telefono,
        fotoPath,
        numero_colegiado,
        especialidad,
        direccion_clinica,
        correo,
        passwordEncriptada,
        "pendiente",
      ],
    );

    res.status(201).json({
      mensaje:
        "Registro completado. Su cuenta está pendiente de aprobación por el administrador.",
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
    const result = await pool.query("SELECT * FROM medicos WHERE correo = $1", [
      correo,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const medico = result.rows[0];

    // 2. VALIDACIÓN CRÍTICA: ¿Está aprobado? (Requisito de la Fase 1)
    if (medico.estado !== "aprobado") {
      return res.status(403).json({
        error: "Su cuenta está pendiente de aprobación por el administrador.",
      });
    }

    // 3. Comparar contraseña (Hash)
    const passwordValida = await bcrypt.compare(password, medico.contrasena);
    if (!passwordValida) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // 4. Generar Token de Sesión (Igual que pacientes, pero con rol 'medico')
    const token = jwt.sign(
      { id: medico.id, rol: "medico" },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "8h" },
    );

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: medico.id,
        nombre: medico.nombre,
        rol: "medico",
        foto: medico.foto,
      },
    });
  } catch (error) {
    console.error("Error en login médico:", error.message);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
};

// LOGIN ADMINISTRADOR - PRIMER FACTOR (HU-004)
// Solo valida usuario y contraseña predeterminados
const loginAdmin = async (req, res) => {
  const { usuario, password } = req.body;

  try {
    // Credenciales predeterminadas del administrador
    const adminUsuario = "admin";
    const adminPassword = "admin123";

    console.log("Primer factor - Validando credenciales iniciales...");
    console.log("Usuario ingresado:", usuario);
    console.log("Usuario esperado:", adminUsuario);

    // Validar usuario y password del primer factor
    if (usuario !== adminUsuario || password !== adminPassword) {
      console.log("Credenciales inválidas en primer factor");
      return res.status(400).json({ error: "Usuario o contraseña inválidos" });
    }

    console.log("Primer factor validado - Generando token temporal...");

    // Generar token temporal con rol "admin-pending-2fa" (válido por 10 minutos)
    const tokenTemporal = jwt.sign(
      { id: "admin", rol: "admin-pending-2fa", usuario },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "10m" },
    );

    res.json({
      mensaje:
        "Primer factor completado. Proceda con la autenticación de segundo factor.",
      tokenTemporal,
      requiere2FA: true,
    });
  } catch (error) {
    console.error("Error en primer factor:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// VALIDACIÓN DE SEGUNDO FACTOR (HU-004)
// Valida la contraseña encriptada del archivo auth2-ayd1.txt
const validar2FA = async (req, res) => {
  const { password2fa } = req.body;
  const tokenTemporal = req.headers.authorization?.split(" ")[1];

  try {
    // 1. Verificar token temporal
    if (!tokenTemporal) {
      return res.status(401).json({ error: "Token temporal no proporcionado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        tokenTemporal,
        process.env.JWT_SECRET || "mi_clave_secreta",
      );
    } catch (error) {
      return res
        .status(401)
        .json({ error: "Token temporal expirado. Inicie sesión nuevamente" });
    }

    if (decoded.rol !== "admin-pending-2fa") {
      return res
        .status(401)
        .json({ error: "Token inválido para segundo factor" });
    }

    console.log("Segundo factor - Validando contraseña encriptada...");

    // 2. Leer el archivo auth2-ayd1.txt
    const filePath = path.join(process.cwd(), "auth2-ayd1.txt");
    console.log("Buscando archivo en:", filePath);

    const passwordHash = fs.readFileSync(filePath, "utf-8").trim();
    console.log("Archivo leído correctamente");

    // 3. Comparar password con el hash del archivo (bcryptjs)
    const passwordValida = await bcrypt.compare(password2fa, passwordHash);
    console.log("Contraseña ingresada comparada con hash del archivo");

    if (!passwordValida) {
      console.log("Contraseña encriptada inválida");
      return res
        .status(400)
        .json({ error: "Contraseña de segundo factor inválida" });
    }

    console.log("Segundo factor validado - Generando token final...");

    // 4. Generar token final con rol "admin" completo (8 horas)
    const tokenFinal = jwt.sign(
      { id: "admin", rol: "admin", usuario: decoded.usuario },
      process.env.JWT_SECRET || "mi_clave_secreta",
      { expiresIn: "8h" },
    );

    res.json({
      mensaje: "Autenticación completada exitosamente",
      token: tokenFinal,
      usuario: {
        id: "admin",
        nombre: "Administrador",
        rol: "admin",
        usuario: decoded.usuario,
      },
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("Archivo auth2-ayd1.txt no encontrado");
      return res
        .status(500)
        .json({ error: "Error de configuración del servidor" });
    }
    console.error("Error en segundo factor:", error.message);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Modulo administrador (HU-005) para aprobar o rechazar usuarios.
const obtenerMedicosPendientes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, apellido, especialidad, correo, estado FROM medicos WHERE estado = 'pendiente'",
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al obtener médicos pendientes" });
  }
};

const aprobarMedico = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE medicos SET estado = 'aprobado' WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Médico no encontrado" });
    }

    res.json({ mensaje: "Médico aprobado correctamente" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al aprobar médico" });
  }
};

const rechazarMedico = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("UPDATE medicos SET estado = 'rechazado' WHERE id = $1", [
      id,
    ]);

    res.json({ mensaje: "Médico rechazado correctamente" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error al rechazar médico" });
  }
};

module.exports = {
  registrarPaciente,
  loginPaciente,
  registrarMedico,
  loginMedico,
  loginAdmin,
  validar2FA,
  obtenerMedicosPendientes,
  aprobarMedico,
  rechazarMedico,
};
